import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, combineLatest } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { PetsService } from '../../pets/services/pets.service';
import { CareSession, CreateCareSessionRequest, UpdateCareSessionRequest } from '../../../core/models/care-session.model';

@Injectable({
  providedIn: 'root'
})
export class CareSessionsService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly roleFilter = inject(RoleFilterService);
  private readonly petsService = inject(PetsService);

  // Signals para estado reactivo
  private readonly _sessions = signal<CareSession[]>([]);
  private readonly _selectedSession = signal<CareSession | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly sessions = this._sessions.asReadonly();
  readonly selectedSession = this._selectedSession.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todas las sesiones de cuidado
   */
  getSessions(): Observable<CareSession[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<CareSession[]>(`${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}`).pipe(
      map((sessions) => {
        // Para owners, necesitamos filtrar por sus mascotas
        // Primero obtenemos las mascotas filtradas (que ya están filtradas por rol)
        const ownerPets = this.petsService.pets();
        const ownerPetIds = ownerPets.map(pet => pet.id.toString());
        return this.roleFilter.filterCareSessions(sessions, ownerPetIds);
      }),
      tap((sessions) => {
        this._sessions.set(sessions);
        this.logger.info('Sesiones de cuidado cargadas', { count: sessions.length });
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
   * Obtiene sesiones por petId
   */
  getSessionsByPetId(petId: string): Observable<CareSession[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<CareSession[]>(
      `${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}?petId=${petId}`
    ).pipe(
      tap((sessions) => {
        this.logger.info('Sesiones cargadas para mascota', { petId, count: sessions.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar sesiones por mascota', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene una sesión por ID
   */
  getSessionById(id: string): Observable<CareSession | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<CareSession>(`${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}/${id}`).pipe(
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
  createSession(sessionData: CreateCareSessionRequest): Observable<CareSession | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<CareSession>(
      `${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}`,
      sessionData
    ).pipe(
      tap((session) => {
        this._sessions.update(sessions => [...sessions, session]);
        this.logger.info('Sesión creada', { id: session.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al crear sesión', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Marca una sesión como pagada
   */
  markAsPaid(id: string): Observable<CareSession | null> {
    return this.updateSession(id, { paid: true });
  }

  /**
   * Actualiza una sesión
   */
  updateSession(id: string, sessionData: UpdateCareSessionRequest): Observable<CareSession | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.patch<CareSession>(
      `${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}/${id}`,
      sessionData
    ).pipe(
      tap((session) => {
        this._sessions.update(sessions => sessions.map(s => s.id === id ? session : s));
        this._selectedSession.set(session);
        this.logger.info('Sesión actualizada', { id: session.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al actualizar sesión', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Elimina una sesión
   */
  deleteSession(id: string): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}/${id}`).pipe(
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
  selectSession(session: CareSession | null): void {
    this._selectedSession.set(session);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }
}

