import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PatientsService } from '../services/patients.service';
import { SessionsService } from '../../sessions/services/sessions.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';
import { CurrencyUtil } from '../../../core/utils/currency.util';
import { SessionPaymentUtil } from '../../../core/utils/session-payment.util';

@Component({
  selector: 'app-patients-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './patients-detail.component.html',
  styleUrl: './patients-detail.component.css'
})
export class PatientsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patientsService = inject(PatientsService);
  private readonly sessionsService = inject(SessionsService);

  readonly selectedPatient = this.patientsService.selectedPatient;
  readonly isLoading = this.patientsService.isLoading;
  readonly error = this.patientsService.error;
  readonly sessions = this.sessionsService.sessions;
  
  // Exponer utils para el template
  readonly DateUtil = DateUtil;
  readonly CurrencyUtil = CurrencyUtil;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientsService.getPatientById(parseInt(id)).subscribe();
      this.sessionsService.getSessions().subscribe();
    }
  }

  getPatientSessions() {
    const patient = this.selectedPatient();
    if (!patient) return [];
    return this.sessions().filter(s => s.patientId === patient.id);
  }

  getTotalPaid(): number {
    const sessions = this.getPatientSessions();
    return sessions
      .filter(s => s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }

  getTotalPending(): number {
    const sessions = this.getPatientSessions();
    return sessions
      .filter(s => !s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }

  deletePatient(): void {
    const patient = this.selectedPatient();
    if (patient && confirm('¿Estás seguro de eliminar este dueño?')) {
      this.patientsService.deletePatient(patient.id).subscribe({
        next: () => {
          // Redirigir a la lista
          window.location.href = '/patients';
        }
      });
    }
  }
}

