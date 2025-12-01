import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { PatientsService } from '../patients/services/patients.service';
import { PetsService } from '../pets/services/pets.service';
import { CareSessionsService } from '../care-sessions/services/care-sessions.service';
import { LocationsService } from '../locations/services/locations.service';
import { SessionsService } from '../sessions/services/sessions.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../core/utils/date.util';
import { CurrencyUtil } from '../../core/utils/currency.util';
import { StatusUtil } from '../../core/utils/status.util';
import { LocationUtil } from '../../core/utils/location.util';
import { MapUtil } from '../../core/utils/map.util';

interface DashboardStats {
  totalPatients: number;
  totalPets: number;
  totalCareSessions: number;
  totalLocations: number;
  upcomingSessions: number;
  totalPaid: number;
  totalPending: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly petsService = inject(PetsService);
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly locationsService = inject(LocationsService);
  private readonly sessionsService = inject(SessionsService);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly patients = this.patientsService.patients;
  readonly pets = this.petsService.pets;
  readonly careSessions = this.careSessionsService.sessions;
  readonly locations = this.locationsService.locations;
  readonly sessions = this.sessionsService.sessions;

  // Estadísticas calculadas
  readonly stats = computed<DashboardStats>(() => {
    const patients = this.patients();
    const pets = this.pets();
    const careSessions = this.careSessions();
    const locations = this.locations();
    const sessions = this.sessions();

    const now = new Date();
    const upcomingSessions = careSessions.filter(s => {
      const startTime = new Date(s.startTime);
      return startTime >= now && s.status === 'scheduled';
    }).length;

    const totalPaid = sessions
      .filter(s => s.pagado && s.precio != null)
      .reduce((sum, s) => sum + (Number(s.precio) || 0), 0);
    const totalPending = sessions
      .filter(s => !s.pagado && s.precio != null)
      .reduce((sum, s) => sum + (Number(s.precio) || 0), 0);

    return {
      totalPatients: patients.length,
      totalPets: pets.length,
      totalCareSessions: careSessions.length,
      totalLocations: locations.length,
      upcomingSessions,
      totalPaid,
      totalPending
    };
  });

  // Próximas sesiones (próximos 5 días)
  readonly upcomingSessions = computed(() => {
    const sessions = this.careSessions();
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    return sessions
      .filter(s => {
        const startTime = new Date(s.startTime);
        return startTime >= now && startTime <= fiveDaysFromNow && s.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  });

  // Ubicaciones con información relacionada
  readonly locationsWithData = computed(() => {
    const locations = this.locations();
    const pets = this.pets();
    const patients = this.patients();

    return locations.map(location => {
      const pet = location.petId ? pets.find(p => p.id === location.petId) : null;
      const patient = patients.find(p => p.id.toString() === location.ownerId.toString());
      
      return {
        ...location,
        pet,
        patient
      };
    });
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  /**
   * Carga todos los datos en paralelo usando forkJoin
   * SOLID: Single Responsibility - Solo se encarga de orquestar la carga de datos
   * Clean Code: Elimina callback hell usando RxJS forkJoin
   */
  loadAllData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      patients: this.patientsService.getPatients().pipe(
        catchError(error => {
          this.handleError('Error al cargar pacientes', error);
          return of(null);
        })
      ),
      pets: this.petsService.getPets().pipe(
        catchError(error => {
          this.handleError('Error al cargar mascotas', error);
          return of(null);
        })
      ),
      careSessions: this.careSessionsService.getSessions().pipe(
        catchError(error => {
          this.handleError('Error al cargar sesiones de cuidado', error);
          return of(null);
        })
      ),
      locations: this.locationsService.getLocations().pipe(
        catchError(error => {
          this.handleError('Error al cargar ubicaciones', error);
          return of(null);
        })
      ),
      sessions: this.sessionsService.getSessions().pipe(
        catchError(error => {
          this.handleError('Error al cargar sesiones', error);
          return of(null);
        })
      )
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        this.handleError('Error general al cargar datos', error);
      }
    });
  }

  private handleError(message: string, error: any): void {
    this.error.set(message);
    this.isLoading.set(false);
    console.error(message, error);
  }

  // Exponer utils para el template (DRY)
  readonly CurrencyUtil = CurrencyUtil;
  readonly StatusUtil = StatusUtil;
  readonly LocationUtil = LocationUtil;
  readonly MapUtil = MapUtil;
  readonly DateUtil = DateUtil;

  // Relaciones entre pacientes y mascotas
  readonly patientPetRelations = computed(() => {
    const patients = this.patients();
    const pets = this.pets();
    const careSessions = this.careSessions();
    const locations = this.locations();
    const sessions = this.sessions();

    return patients.map(patient => {
      const patientPets = pets.filter(p => p.ownerId.toString() === patient.id.toString());
      
      return patientPets.map(pet => {
        const petSessions = careSessions.filter(s => s.petId === pet.id);
        const petLocations = locations.filter(l => l.petId === pet.id);
        const patientSessions = sessions.filter(s => s.patientId && s.patientId.toString() === patient.id.toString());
        
        return {
          patient,
          pet,
          sessionsCount: petSessions.length,
          locationsCount: petLocations.length,
          totalPaid: patientSessions
            .filter(s => s.pagado && s.precio != null)
            .reduce((sum, s) => sum + (Number(s.precio) || 0), 0),
          totalPending: patientSessions
            .filter(s => !s.pagado && s.precio != null)
            .reduce((sum, s) => sum + (Number(s.precio) || 0), 0)
        };
      });
    }).flat();
  });
}

