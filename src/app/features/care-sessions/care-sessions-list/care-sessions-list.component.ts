import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CareSessionsService } from '../services/care-sessions.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CareSessionsDetailComponent } from '../care-sessions-detail/care-sessions-detail.component';
import { PetAvatarComponent } from '../../../shared/components/pet-avatar/pet-avatar.component';
import { DateUtil } from '../../../core/utils/date.util';
import { StatusUtil } from '../../../core/utils/status.util';
import { CareSession } from '../../../core/models/care-session.model';

@Component({
  selector: 'app-care-sessions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, ModalComponent, CareSessionsDetailComponent, PetAvatarComponent],
  templateUrl: './care-sessions-list.component.html',
  styleUrl: './care-sessions-list.component.css'
})
export class CareSessionsListComponent implements OnInit {
  private readonly careSessionsService = inject(CareSessionsService);

  readonly sessions = this.careSessionsService.sessions;
  readonly isLoading = this.careSessionsService.isLoading;
  readonly error = this.careSessionsService.error;

  readonly showDetailModal = signal<boolean>(false);
  readonly selectedSessionId = signal<string | null>(null);

  readonly DateUtil = DateUtil;
  readonly StatusUtil = StatusUtil;

  ngOnInit(): void {
    this.careSessionsService.getSessions().subscribe();
  }

  markAsPaid(sessionId: string): void {
    if (confirm('¿Marcar esta sesión como pagada?')) {
      this.careSessionsService.markAsPaid(sessionId).subscribe();
    }
  }

  openDetailModal(sessionId: string): void {
    this.selectedSessionId.set(sessionId);
    this.careSessionsService.getSessionById(sessionId).subscribe(() => {
      this.showDetailModal.set(true);
    });
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedSessionId.set(null);
  }
}

