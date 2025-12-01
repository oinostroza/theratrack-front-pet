import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientsService } from '../services/patients.service';
import { SessionsService } from '../../sessions/services/sessions.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';
import { CurrencyUtil } from '../../../core/utils/currency.util';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.css'
})
export class PatientsListComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly sessionsService = inject(SessionsService);

  readonly patients = this.patientsService.patients;
  readonly isLoading = this.patientsService.isLoading;
  readonly error = this.patientsService.error;
  readonly sessions = this.sessionsService.sessions;

  // Estado de expansión por paciente
  readonly expandedPatients = signal<Set<number>>(new Set());

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
    const sessions = this.getPatientSessions(patientId);
    return sessions
      .filter(s => s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }

  getTotalPending(patientId: number): number {
    const sessions = this.getPatientSessions(patientId);
    return sessions
      .filter(s => !s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }

  getSessionCount(patientId: number): number {
    return this.getPatientSessions(patientId).length;
  }

  // Métodos para manejar expansión
  togglePatientDetails(patientId: number): void {
    const expanded = new Set(this.expandedPatients());
    if (expanded.has(patientId)) {
      expanded.delete(patientId);
    } else {
      expanded.add(patientId);
    }
    this.expandedPatients.set(expanded);
  }

  isPatientExpanded(patientId: number): boolean {
    return this.expandedPatients().has(patientId);
  }

  // Métodos para obtener datos del paciente expandido
  getPatientSessionsForDetail(patientId: number) {
    return this.sessions().filter(s => s.patientId === patientId);
  }

  getTotalPaidForDetail(patientId: number): number {
    const sessions = this.getPatientSessionsForDetail(patientId);
    return sessions
      .filter(s => s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }

  getTotalPendingForDetail(patientId: number): number {
    const sessions = this.getPatientSessionsForDetail(patientId);
    return sessions
      .filter(s => !s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }
}

