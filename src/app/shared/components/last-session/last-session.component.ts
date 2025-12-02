import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { CareSessionsService } from '../../../features/care-sessions/services/care-sessions.service';
import { SessionReportsService } from '../../../features/session-reports/services/session-reports.service';
import { PhotosService } from '../../../features/photos/services/photos.service';
import { LocationsService } from '../../../features/locations/services/locations.service';
import { DateUtil } from '../../../core/utils/date.util';
import { StatusUtil } from '../../../core/utils/status.util';
import { CareSession } from '../../../core/models/care-session.model';
import { SessionReport } from '../../../core/models/session-report.model';
import { Photo } from '../../../core/models/photo.model';
import { Location } from '../../../core/models/location.model';

@Component({
  selector: 'app-last-session',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './last-session.component.html',
  styleUrl: './last-session.component.css'
})
export class LastSessionComponent {
  @Input() petId?: string;
  @Input() ownerId?: string;
  @Input() showDetailsButton: boolean = true;
  @Output() viewDetails = new EventEmitter<CareSession>();

  private readonly careSessionsService = inject(CareSessionsService);
  private readonly sessionReportsService = inject(SessionReportsService);
  private readonly photosService = inject(PhotosService);
  private readonly locationsService = inject(LocationsService);

  readonly DateUtil = DateUtil;
  readonly StatusUtil = StatusUtil;
  
  // Exponer el signal de sesiones para reactividad en el template
  readonly sessions = this.careSessionsService.sessions;
  
  // Estado de expansión
  readonly isExpanded = signal<boolean>(false);
  readonly isLoadingDetails = signal<boolean>(false);
  
  // Datos relacionados
  readonly sessionReport = signal<SessionReport | null>(null);
  readonly sessionPhotos = signal<Photo[]>([]);
  readonly sessionLocation = signal<Location | null>(null);

  // Método helper para calcular la última sesión
  getLastSession(): CareSession | null {
    const allSessions = this.sessions();
    
    if (this.petId) {
      // Filtrar sesiones de la mascota específica
      const petSessions = allSessions.filter(s => s.petId === this.petId);
      if (petSessions.length === 0) return null;
      
      // Ordenar por fecha descendente y tomar la primera
      const sorted = [...petSessions].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      return sorted[0];
    } else if (this.ownerId) {
      // Filtrar sesiones de todas las mascotas del owner
      const ownerSessions = allSessions.filter(s => 
        s.pet?.ownerId?.toString() === this.ownerId
      );
      if (ownerSessions.length === 0) return null;
      
      // Ordenar por fecha descendente y tomar la primera
      const sorted = [...ownerSessions].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      return sorted[0];
    }
    
    return null;
  }

  toggleExpand(): void {
    const wasExpanded = this.isExpanded();
    this.isExpanded.set(!wasExpanded);
    
    if (!wasExpanded) {
      // Cargar datos relacionados cuando se expande
      this.loadSessionDetails();
    } else if (this.petId && !this.sessionLocation()) {
      // Si se colapsa y tenemos petId pero no ubicación, intentar cargar ubicación del pet
      this.loadPetLocation();
    }
  }

  private loadPetLocation(): void {
    if (!this.petId) return;
    
    this.locationsService.getLocationsByPetId(this.petId).subscribe({
      next: (locations) => {
        // Preferir ubicación tipo 'home'
        const homeLocation = locations.find(loc => loc.type === 'home');
        this.sessionLocation.set(homeLocation || (locations.length > 0 ? locations[0] : null));
      }
    });
  }

  private loadSessionDetails(): void {
    const session = this.getLastSession();
    if (!session) return;

    this.isLoadingDetails.set(true);
    
    // Cargar reportes, fotos y ubicaciones
    // Si tenemos petId, cargar ubicaciones del pet; si no, intentar cargar todas las ubicaciones
    const locationObservable = session.petId 
      ? this.locationsService.getLocationsByPetId(session.petId)
      : (this.petId 
          ? this.locationsService.getLocationsByPetId(this.petId)
          : of([]));
    
    forkJoin({
      reports: this.sessionReportsService.getReportsBySessionId(session.id),
      photos: this.photosService.getPhotosBySessionId(session.id),
      locations: locationObservable
    }).subscribe({
      next: ({ reports, photos, locations }) => {
        this.sessionReport.set(reports.length > 0 ? reports[0] : null);
        this.sessionPhotos.set(photos);
        // Tomar la primera ubicación del pet (preferir tipo 'home')
        const homeLocation = locations.find(loc => loc.type === 'home');
        this.sessionLocation.set(homeLocation || (locations.length > 0 ? locations[0] : null));
        this.isLoadingDetails.set(false);
      },
      error: () => {
        this.isLoadingDetails.set(false);
      }
    });
  }
}

