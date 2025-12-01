import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CareSessionsService } from '../../../features/care-sessions/services/care-sessions.service';
import { DateUtil } from '../../../core/utils/date.util';
import { CareSession } from '../../../core/models/care-session.model';

@Component({
  selector: 'app-last-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './last-session.component.html',
  styleUrl: './last-session.component.css'
})
export class LastSessionComponent implements OnInit, OnChanges {
  @Input() petId?: string;
  @Input() ownerId?: string;
  @Input() showDetailsButton: boolean = true;
  @Output() viewDetails = new EventEmitter<CareSession>();

  private readonly careSessionsService = inject(CareSessionsService);

  readonly isLoading = signal<boolean>(false);
  readonly lastSession = signal<CareSession | null>(null);
  readonly isExpanded = signal<boolean>(false);

  readonly DateUtil = DateUtil;

  ngOnInit(): void {
    this.loadLastSession();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['petId'] || changes['ownerId']) {
      this.loadLastSession();
    }
  }

  private loadLastSession(): void {
    if (!this.petId && !this.ownerId) return;

    this.isLoading.set(true);
    
    if (this.petId) {
      // Cargar última sesión de una mascota específica
      this.careSessionsService.getSessionsByPetId(this.petId).subscribe({
        next: (sessions) => {
          const sorted = sessions.sort((a, b) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
          this.lastSession.set(sorted.length > 0 ? sorted[0] : null);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else if (this.ownerId) {
      // Cargar última sesión de todas las mascotas de un owner
      this.careSessionsService.getSessions().subscribe({
        next: (allSessions) => {
          // Filtrar sesiones del owner basándose en pet.ownerId
          const sorted = allSessions
            .filter(s => s.pet?.ownerId?.toString() === this.ownerId)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          this.lastSession.set(sorted.length > 0 ? sorted[0] : null);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    }
  }

  onViewDetails(): void {
    const session = this.lastSession();
    if (session) {
      this.isExpanded.set(!this.isExpanded());
      if (this.isExpanded()) {
        this.viewDetails.emit(session);
      }
    }
  }
}

