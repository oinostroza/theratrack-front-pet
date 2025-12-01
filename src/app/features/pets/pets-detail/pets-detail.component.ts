import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PetsService } from '../services/pets.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { LocationsService } from '../../locations/services/locations.service';
import { SessionReportsService } from '../../session-reports/services/session-reports.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
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
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, PetAvatarComponent],
  templateUrl: './pets-detail.component.html',
  styleUrl: './pets-detail.component.css'
})
export class PetsDetailComponent implements OnInit {
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

  readonly DateUtil = DateUtil;
  readonly StatusUtil = StatusUtil;
  readonly LocationUtil = LocationUtil;

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.petsService.getPetById(petId).subscribe((pet) => {
        if (pet) {
          this.loadRelatedData(pet.id);
        }
      });
    }
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

  deletePet(): void {
    const pet = this.selectedPet();
    if (pet && confirm(`¿Estás seguro de eliminar a ${pet.name}?`)) {
      this.petsService.deletePet(pet.id).subscribe((success) => {
        if (success) {
          this.router.navigate(['/pets']);
        }
      });
    }
  }
}

