import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { PetsService } from '../../pets/services/pets.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { SessionReport, CreateSessionReportRequest, UpdateSessionReportRequest } from '../../../core/models/session-report.model';

@Injectable({
  providedIn: 'root'
})
export class SessionReportsService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly roleFilter = inject(RoleFilterService);
  private readonly petsService = inject(PetsService);
  private readonly careSessionsService = inject(CareSessionsService);

  // Signals para estado reactivo
  private readonly _reports = signal<SessionReport[]>([]);
  private readonly _selectedReport = signal<SessionReport | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly reports = this._reports.asReadonly();
  readonly selectedReport = this._selectedReport.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todos los reportes
   */
  getReports(): Observable<SessionReport[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<SessionReport[]>(`${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}`).pipe(
      map((reports) => {
        const user = this.roleFilter.getCurrentUser();
        if (user?.role === 'owner') {
          const ownerPets = this.petsService.pets();
          const ownerPetIds = ownerPets.map(pet => pet.id.toString());
          return this.roleFilter.filterSessionReports(reports, ownerPetIds);
        } else if (user?.role === 'sitter') {
          const sitterSessions = this.careSessionsService.sessions();
          const sitterSessionIds = sitterSessions.map(session => session.id.toString());
          return this.roleFilter.filterSessionReports(reports, undefined, sitterSessionIds);
        }
        return this.roleFilter.filterSessionReports(reports);
      }),
      tap((reports) => {
        this._reports.set(reports);
        this.logger.info('Reportes cargados', { count: reports.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar reportes', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene reportes por petId
   */
  getReportsByPetId(petId: string): Observable<SessionReport[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<SessionReport[]>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}?petId=${petId}`
    ).pipe(
      tap((reports) => {
        this.logger.info('Reportes cargados para mascota', { petId, count: reports.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar reportes por mascota', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene reportes por careSessionId
   */
  getReportsBySessionId(careSessionId: string): Observable<SessionReport[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<SessionReport[]>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}?careSessionId=${careSessionId}`
    ).pipe(
      tap((reports) => {
        this.logger.info('Reportes cargados para sesión', { careSessionId, count: reports.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar reportes por sesión', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene un reporte por ID
   */
  getReportById(id: string): Observable<SessionReport | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<SessionReport>(`${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}/${id}`).pipe(
      tap((report) => {
        this._selectedReport.set(report);
        this.logger.info('Reporte cargado', { id: report.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar reporte', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Crea un nuevo reporte
   */
  createReport(reportData: CreateSessionReportRequest): Observable<SessionReport | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<SessionReport>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}`,
      reportData
    ).pipe(
      tap((report) => {
        this._reports.update(reports => [...reports, report]);
        this.logger.info('Reporte creado', { id: report.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al crear reporte', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Actualiza un reporte
   */
  updateReport(id: string, reportData: UpdateSessionReportRequest): Observable<SessionReport | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.patch<SessionReport>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}/${id}`,
      reportData
    ).pipe(
      tap((report) => {
        this._reports.update(reports => reports.map(r => r.id === id ? report : r));
        this._selectedReport.set(report);
        this.logger.info('Reporte actualizado', { id: report.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al actualizar reporte', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Elimina un reporte
   */
  deleteReport(id: string): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}/${id}`).pipe(
      tap(() => {
        this._reports.update(reports => reports.filter(r => r.id !== id));
        if (this._selectedReport()?.id === id) {
          this._selectedReport.set(null);
        }
        this.logger.info('Reporte eliminado', { id });
        this._isLoading.set(false);
      }),
      map(() => true),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al eliminar reporte', errorInfo);
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona un reporte
   */
  selectReport(report: SessionReport | null): void {
    this._selectedReport.set(report);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }
}

