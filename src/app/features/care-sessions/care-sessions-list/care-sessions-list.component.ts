import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CareSessionsService } from '../services/care-sessions.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CareSessionsDetailComponent } from '../care-sessions-detail/care-sessions-detail.component';
import { CareSessionsFormComponent } from '../care-sessions-form/care-sessions-form.component';
import { PetAvatarComponent } from '../../../shared/components/pet-avatar/pet-avatar.component';
import { DateUtil } from '../../../core/utils/date.util';
import { StatusUtil } from '../../../core/utils/status.util';
import { CareSession } from '../../../core/models/care-session.model';

@Component({
  selector: 'app-care-sessions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent, ErrorDisplayComponent, ModalComponent, CareSessionsDetailComponent, CareSessionsFormComponent, PetAvatarComponent],
  templateUrl: './care-sessions-list.component.html',
  styleUrl: './care-sessions-list.component.css'
})
export class CareSessionsListComponent implements OnInit {
  private readonly careSessionsService = inject(CareSessionsService);

  readonly sessions = this.careSessionsService.sessions;
  readonly isLoading = this.careSessionsService.isLoading;
  readonly error = this.careSessionsService.error;

  readonly searchTerm = signal<string>('');
  readonly showDetailModal = signal<boolean>(false);
  readonly selectedSessionId = signal<string | null>(null);
  readonly showNewModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly selectedEditSessionId = signal<string | null>(null);

  readonly DateUtil = DateUtil;
  readonly StatusUtil = StatusUtil;

  // Filtrar sesiones basado en búsqueda
  readonly filteredSessions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.sessions();
    
    return this.sessions().filter(session => {
      const petName = (session.pet?.name || '').toLowerCase();
      const petSpecies = (session.pet?.species || '').toLowerCase();
      const ownerName = (session.owner?.name || '').toLowerCase();
      const ownerEmail = (session.owner?.email || '').toLowerCase();
      const startDate = DateUtil.formatDateShort(session.startTime).toLowerCase();
      const status = StatusUtil.getStatusLabel(session.status).toLowerCase();
      const paid = session.paid ? 'pagado' : 'pendiente';
      
      return petName.includes(term) ||
             petSpecies.includes(term) ||
             ownerName.includes(term) ||
             ownerEmail.includes(term) ||
             startDate.includes(term) ||
             status.includes(term) ||
             paid.includes(term);
    });
  });

  ngOnInit(): void {
    this.careSessionsService.getSessions().subscribe();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
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

  openNewModal(): void {
    this.showNewModal.set(true);
  }

  closeNewModal(): void {
    this.showNewModal.set(false);
    // Recargar sesiones después de crear
    this.careSessionsService.getSessions().subscribe();
  }

  openEditModal(sessionId: string): void {
    this.selectedEditSessionId.set(sessionId);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedEditSessionId.set(null);
    // Recargar sesiones después de editar
    this.careSessionsService.getSessions().subscribe();
  }
}

