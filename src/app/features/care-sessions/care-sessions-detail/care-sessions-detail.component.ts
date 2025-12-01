import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CareSessionsService } from '../services/care-sessions.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';
import { StatusUtil } from '../../../core/utils/status.util';

@Component({
  selector: 'app-care-sessions-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './care-sessions-detail.component.html',
  styleUrl: './care-sessions-detail.component.css'
})
export class CareSessionsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly careSessionsService = inject(CareSessionsService);

  readonly selectedSession = this.careSessionsService.selectedSession;
  readonly isLoading = this.careSessionsService.isLoading;
  readonly error = this.careSessionsService.error;

  readonly DateUtil = DateUtil;
  readonly StatusUtil = StatusUtil;

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('id');
    if (sessionId) {
      this.careSessionsService.getSessionById(sessionId).subscribe();
    }
  }

  deleteSession(): void {
    const session = this.selectedSession();
    if (session && confirm(`¿Estás seguro de eliminar esta sesión?`)) {
      this.careSessionsService.deleteSession(session.id).subscribe((success) => {
        if (success) {
          this.router.navigate(['/care-sessions']);
        }
      });
    }
  }
}

