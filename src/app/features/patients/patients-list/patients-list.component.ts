import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientsService } from '../services/patients.service';
import { SessionsService } from '../../sessions/services/sessions.service';
import { PetsService } from '../../pets/services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { PetAvatarComponent } from '../../../shared/components/pet-avatar/pet-avatar.component';
import { DateUtil } from '../../../core/utils/date.util';
import { CurrencyUtil } from '../../../core/utils/currency.util';
import { SessionPaymentUtil } from '../../../core/utils/session-payment.util';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, PetAvatarComponent],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.css'
})
export class PatientsListComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly sessionsService = inject(SessionsService);
  private readonly petsService = inject(PetsService);

  readonly patients = this.patientsService.patients;
  readonly isLoading = this.patientsService.isLoading;
  readonly error = this.patientsService.error;
  readonly sessions = this.sessionsService.sessions;

  // Estado de expansión por paciente y sus mascotas
  readonly expandedPatients = signal<Set<number>>(new Set());
  readonly patientPets = signal<Map<number, Pet[]>>(new Map());

  // Exponer utils para el template
  readonly DateUtil = DateUtil;
  readonly CurrencyUtil = CurrencyUtil;

  ngOnInit(): void {
    this.patientsService.getPatients().subscribe();
    this.sessionsService.getSessions().subscribe();
  }

  getPatientSessions(patientId: number) {
    const sessions = this.sessionsService.sessions();
    return sessions.filter(s => s.patientId === patientId);
  }

  getTotalPaid(patientId: number): number {
    return SessionPaymentUtil.calculateTotalPaidForPatient(
      this.sessionsService.sessions(),
      patientId
    );
  }

  getTotalPending(patientId: number): number {
    return SessionPaymentUtil.calculateTotalPendingForPatient(
      this.sessionsService.sessions(),
      patientId
    );
  }

  getSessionCount(patientId: number): number {
    return SessionPaymentUtil.getSessionCountForPatient(
      this.sessionsService.sessions(),
      patientId
    );
  }

  // Métodos para manejar expansión
  togglePatientDetails(patientId: number): void {
    const expanded = new Set(this.expandedPatients());
    if (expanded.has(patientId)) {
      expanded.delete(patientId);
    } else {
      expanded.add(patientId);
      // Cargar mascotas del dueño si no están cargadas
      if (!this.patientPets().has(patientId)) {
        this.petsService.getPetsByOwnerId(patientId).subscribe((pets) => {
          const petsMap = new Map(this.patientPets());
          petsMap.set(patientId, pets);
          this.patientPets.set(petsMap);
        });
      }
    }
    this.expandedPatients.set(expanded);
  }

  getPatientPets(patientId: number): Pet[] {
    return this.patientPets().get(patientId) || [];
  }

  isPatientExpanded(patientId: number): boolean {
    return this.expandedPatients().has(patientId);
  }

  // Métodos para obtener datos del paciente expandido
  getPatientSessionsForDetail(patientId: number) {
    return this.sessions().filter(s => s.patientId === patientId);
  }

  getTotalPaidForDetail(patientId: number): number {
    return this.getTotalPaid(patientId);
  }

  getTotalPendingForDetail(patientId: number): number {
    return this.getTotalPending(patientId);
  }
}

