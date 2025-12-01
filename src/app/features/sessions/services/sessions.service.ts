import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { SessionPaymentUtil } from '../../../core/utils/session-payment.util';
import { Session, CreateSessionRequest, UpdateSessionRequest } from '../../../core/models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly roleFilter = inject(RoleFilterService);

  // Signals para estado reactivo
  private readonly _sessions = signal<Session[]>([]);
  private readonly _selectedSession = signal<Session | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly sessions = this._sessions.asReadonly();
  readonly selectedSession = this._selectedSession.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todas las sesiones
   */
  getSessions(): Observable<Session[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Session[]>(`${environment.apiUrl}${API_ENDPOINTS.SESSIONS}`).pipe(
      map((sessions) => this.roleFilter.filterSessions(sessions)),
      tap((sessions) => {
        this._sessions.set(sessions);
        this.logger.info('Sesiones cargadas', { count: sessions.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar sesiones', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene sesiones por paciente
   */
  getSessionsByPatientId(patientId: number): Observable<Session[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Session[]>(`${environment.apiUrl}${API_ENDPOINTS.SESSIONS}?patientId=${patientId}`).pipe(
      tap((sessions) => {
        this.logger.info('Sesiones del paciente cargadas', { patientId, count: sessions.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar sesiones del paciente', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene una sesión por ID
   */
  getSessionById(id: number): Observable<Session | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Session>(`${environment.apiUrl}${API_ENDPOINTS.SESSIONS}/${id}`).pipe(
      tap((session) => {
        this._selectedSession.set(session);
        this.logger.info('Sesión cargada', { id: session.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar sesión', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Crea una nueva sesión
   */
  createSession(session: CreateSessionRequest): Observable<Session> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<Session>(`${environment.apiUrl}${API_ENDPOINTS.SESSIONS}`, session).pipe(
      tap((newSession) => {
        this._sessions.update(sessions => [...sessions, newSession]);
        this.logger.info('Sesión creada', { id: newSession.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al crear sesión', errorInfo);
        throw error;
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Actualiza una sesión
   */
  updateSession(id: number, session: UpdateSessionRequest): Observable<Session> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.patch<Session>(`${environment.apiUrl}${API_ENDPOINTS.SESSIONS}/${id}`, session).pipe(
      tap((updatedSession) => {
        this._sessions.update(sessions => 
          sessions.map(s => s.id === id ? updatedSession : s)
        );
        if (this._selectedSession()?.id === id) {
          this._selectedSession.set(updatedSession);
        }
        this.logger.info('Sesión actualizada', { id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al actualizar sesión', errorInfo);
        throw error;
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Elimina una sesión
   */
  deleteSession(id: number): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.SESSIONS}/${id}`).pipe(
      tap(() => {
        this._sessions.update(sessions => sessions.filter(s => s.id !== id));
        if (this._selectedSession()?.id === id) {
          this._selectedSession.set(null);
        }
        this.logger.info('Sesión eliminada', { id });
        this._isLoading.set(false);
      }),
      map(() => true),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al eliminar sesión', errorInfo);
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una sesión
   */
  selectSession(session: Session | null): void {
    this._selectedSession.set(session);
  }

  /**
   * Calcula el total de pagos pendientes
   */
  getTotalPendingPayments(): number {
    return SessionPaymentUtil.calculateTotalPending(this._sessions());
  }

  /**
   * Calcula el total de pagos realizados
   */
  getTotalPaid(): number {
    return SessionPaymentUtil.calculateTotalPaid(this._sessions());
  }
}

