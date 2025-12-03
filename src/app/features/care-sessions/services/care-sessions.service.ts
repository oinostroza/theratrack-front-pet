import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { BaseService } from '../../../core/services/base.service';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { PetsService } from '../../pets/services/pets.service';
import { CareSession, CreateCareSessionRequest, UpdateCareSessionRequest } from '../../../core/models/care-session.model';

@Injectable({
  providedIn: 'root'
})
export class CareSessionsService extends BaseService<CareSession> {
  private readonly http = inject(HttpClient);
  private readonly roleFilter = inject(RoleFilterService);
  private readonly petsService = inject(PetsService);

  protected getLogger(): LoggerService {
    return inject(LoggerService);
  }

  // Exponer signals con nombres específicos del dominio
  readonly sessions = this.items;
  readonly selectedSession = this.selectedItem;

  /**
   * Obtiene todas las sesiones de cuidado
   */
  getSessions(): Observable<CareSession[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<CareSession[]>(`${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}`).pipe(
      map((sessions) => {
        // Para owners, necesitamos filtrar por sus mascotas
        // Primero obtenemos las mascotas filtradas (que ya están filtradas por rol)
        const ownerPets = this.petsService.pets();
        const ownerPetIds = ownerPets.map(pet => pet.id.toString());
        return this.roleFilter.filterCareSessions(sessions, ownerPetIds);
      }),
      tap((sessions) => {
        this._items.set(sessions);
        this.logger.info('Sesiones de cuidado cargadas', { count: sessions.length });
      }),
      catchError((error) => this.handleError<CareSession[]>(error, 'cargar sesiones').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene sesiones por petId
   */
  getSessionsByPetId(petId: string): Observable<CareSession[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<CareSession[]>(
      `${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}?petId=${petId}`
    ).pipe(
      tap((sessions) => {
        this.logger.info('Sesiones cargadas para mascota', { petId, count: sessions.length });
      }),
      catchError((error) => this.handleError<CareSession[]>(error, 'cargar sesiones por mascota').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene una sesión por ID
   */
  getSessionById(id: string): Observable<CareSession | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<CareSession>(`${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}/${id}`).pipe(
      tap((session) => {
        this.selectItem(session);
        this.logger.info('Sesión cargada', { id: session.id });
      }),
      catchError((error) => this.handleError<CareSession | null>(error, 'cargar sesión')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Crea una nueva sesión
   */
  createSession(sessionData: CreateCareSessionRequest): Observable<CareSession | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<CareSession>(
      `${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}`,
      sessionData
    ).pipe(
      tap((session) => {
        this.addItem(session);
        this.logger.info('Sesión creada', { id: session.id });
      }),
      catchError((error) => this.handleError<CareSession | null>(error, 'crear sesión')),
      tap(() => this.setLoading(false))
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
    this.setLoading(true);
    this.clearError();

    return this.http.patch<CareSession>(
      `${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}/${id}`,
      sessionData
    ).pipe(
      tap((session) => {
        this.updateItem(id, session, (s) => s.id);
        this.logger.info('Sesión actualizada', { id: session.id });
      }),
      catchError((error) => this.handleError<CareSession | null>(error, 'actualizar sesión')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Elimina una sesión
   */
  deleteSession(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.CARE_SESSIONS}/${id}`).pipe(
      tap(() => {
        this.removeItem(id, (s) => s.id);
        this.logger.info('Sesión eliminada', { id });
        this.setLoading(false);
      }),
      map(() => true),
      catchError((error) => {
        this.handleError<boolean>(error, 'eliminar sesión');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una sesión
   */
  selectSession(session: CareSession | null): void {
    this.selectItem(session);
  }
}

