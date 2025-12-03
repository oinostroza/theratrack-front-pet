import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { BaseService } from '../../../core/services/base.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { PetsService } from '../../pets/services/pets.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { SessionReport, CreateSessionReportRequest, UpdateSessionReportRequest } from '../../../core/models/session-report.model';

@Injectable({
  providedIn: 'root'
})
export class SessionReportsService extends BaseService<SessionReport> {
  private readonly http = inject(HttpClient);
  private readonly roleFilter = inject(RoleFilterService);
  private readonly petsService = inject(PetsService);
  private readonly careSessionsService = inject(CareSessionsService);

  protected getLogger(): LoggerService {
    return inject(LoggerService);
  }

  // Exponer signals con nombres específicos del dominio
  readonly reports = this.items;
  readonly selectedReport = this.selectedItem;

  /**
   * Obtiene todos los reportes
   */
  getReports(): Observable<SessionReport[]> {
    this.setLoading(true);
    this.clearError();

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
        this._items.set(reports);
        this.logger.info('Reportes cargados', { count: reports.length });
      }),
      catchError((error) => this.handleError<SessionReport[]>(error, 'cargar reportes').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene reportes por petId
   */
  getReportsByPetId(petId: string): Observable<SessionReport[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<SessionReport[]>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}?petId=${petId}`
    ).pipe(
      tap((reports) => {
        this.logger.info('Reportes cargados para mascota', { petId, count: reports.length });
      }),
      catchError((error) => this.handleError<SessionReport[]>(error, 'cargar reportes por mascota').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene reportes por careSessionId
   */
  getReportsBySessionId(careSessionId: string): Observable<SessionReport[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<SessionReport[]>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}?careSessionId=${careSessionId}`
    ).pipe(
      tap((reports) => {
        this.logger.info('Reportes cargados para sesión', { careSessionId, count: reports.length });
      }),
      catchError((error) => this.handleError<SessionReport[]>(error, 'cargar reportes por sesión').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene un reporte por ID
   */
  getReportById(id: string): Observable<SessionReport | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<SessionReport>(`${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}/${id}`).pipe(
      tap((report) => {
        this.selectItem(report);
        this.logger.info('Reporte cargado', { id: report.id });
      }),
      catchError((error) => this.handleError<SessionReport | null>(error, 'cargar reporte')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Crea un nuevo reporte
   */
  createReport(reportData: CreateSessionReportRequest): Observable<SessionReport | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<SessionReport>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}`,
      reportData
    ).pipe(
      tap((report) => {
        this.addItem(report);
        this.logger.info('Reporte creado', { id: report.id });
      }),
      catchError((error) => this.handleError<SessionReport | null>(error, 'crear reporte')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Actualiza un reporte
   */
  updateReport(id: string, reportData: UpdateSessionReportRequest): Observable<SessionReport | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.patch<SessionReport>(
      `${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}/${id}`,
      reportData
    ).pipe(
      tap((report) => {
        this.updateItem(id, report, (r) => r.id);
        this.logger.info('Reporte actualizado', { id: report.id });
      }),
      catchError((error) => this.handleError<SessionReport | null>(error, 'actualizar reporte')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Elimina un reporte
   */
  deleteReport(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.SESSION_REPORTS}/${id}`).pipe(
      tap(() => {
        this.removeItem(id, (r) => r.id);
        this.logger.info('Reporte eliminado', { id });
        this.setLoading(false);
      }),
      map(() => true),
      catchError((error) => {
        this.handleError<boolean>(error, 'eliminar reporte');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona un reporte
   */
  selectReport(report: SessionReport | null): void {
    this.selectItem(report);
  }
}

