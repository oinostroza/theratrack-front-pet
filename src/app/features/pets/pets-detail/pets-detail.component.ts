import { Component, OnInit, OnChanges, SimpleChanges, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PetsService } from '../services/pets.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { LocationsService } from '../../locations/services/locations.service';
import { SessionReportsService } from '../../session-reports/services/session-reports.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CareSessionsDetailComponent } from '../../care-sessions/care-sessions-detail/care-sessions-detail.component';
import { SessionReportsDetailComponent } from '../../session-reports/session-reports-detail/session-reports-detail.component';
import { PetAvatarComponent } from '../../../shared/components/pet-avatar/pet-avatar.component';
import { DateUtil } from '../../../core/utils/date.util';
import { StatusUtil } from '../../../core/utils/status.util';
import { LocationUtil } from '../../../core/utils/location.util';
import { CareSession } from '../../../core/models/care-session.model';
import { Location } from '../../../core/models/location.model';
import { SessionReport } from '../../../core/models/session-report.model';

@Component({
  selector: 'app-pets-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, ModalComponent, CareSessionsDetailComponent, SessionReportsDetailComponent, PetAvatarComponent],
  templateUrl: './pets-detail.component.html',
  styleUrl: './pets-detail.component.css'
})
export class PetsDetailComponent implements OnInit, OnChanges {
  @Input() petId?: string;
  @Input() isModal: boolean = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly petsService = inject(PetsService);
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly locationsService = inject(LocationsService);
  private readonly sessionReportsService = inject(SessionReportsService);

  readonly selectedPet = this.petsService.selectedPet;
  readonly isLoading = this.petsService.isLoading;
  readonly error = this.petsService.error;

  readonly petSessions = signal<CareSession[]>([]);
  readonly petLocations = signal<Location[]>([]);
  readonly petReports = signal<SessionReport[]>([]);
  readonly isLoadingRelated = signal<boolean>(false);
  
  // Estado de modales
  readonly showSessionModal = signal<boolean>(false);
  readonly showReportModal = signal<boolean>(false);
  readonly selectedSessionId = signal<string | null>(null);
  readonly selectedReportId = signal<string | null>(null);

  readonly DateUtil = DateUtil;
  readonly StatusUtil = StatusUtil;
  readonly LocationUtil = LocationUtil;

  ngOnInit(): void {
    const petId = this.petId || this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.loadPetData(petId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['petId'] && this.petId) {
      this.loadPetData(this.petId);
    }
  }

  private loadPetData(petId: string): void {
    this.petsService.getPetById(petId).subscribe((pet) => {
      if (pet) {
        this.loadRelatedData(pet.id);
      }
    });
  }

  private loadRelatedData(petId: string): void {
    this.isLoadingRelated.set(true);
    forkJoin({
      sessions: this.careSessionsService.getSessionsByPetId(petId),
      locations: this.locationsService.getLocationsByPetId(petId),
      reports: this.sessionReportsService.getReportsByPetId(petId)
    }).subscribe({
      next: ({ sessions, locations, reports }) => {
        this.petSessions.set(sessions);
        this.petLocations.set(locations);
        this.petReports.set(reports);
        this.isLoadingRelated.set(false);
      },
      error: () => {
        this.isLoadingRelated.set(false);
      }
    });
  }

  openSessionDetailModal(sessionId: string): void {
    this.selectedSessionId.set(sessionId);
    this.careSessionsService.getSessionById(sessionId).subscribe(() => {
      this.showSessionModal.set(true);
    });
  }

  closeSessionDetailModal(): void {
    this.showSessionModal.set(false);
    this.selectedSessionId.set(null);
  }

  openReportDetailModal(reportId: string): void {
    this.selectedReportId.set(reportId);
    this.sessionReportsService.getReportById(reportId).subscribe(() => {
      this.showReportModal.set(true);
    });
  }

  closeReportDetailModal(): void {
    this.showReportModal.set(false);
    this.selectedReportId.set(null);
  }
}

