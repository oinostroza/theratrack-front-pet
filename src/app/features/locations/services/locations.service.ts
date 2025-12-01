import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { Location, CreateLocationRequest, UpdateLocationRequest } from '../../../core/models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly roleFilter = inject(RoleFilterService);

  // Signals para estado reactivo
  private readonly _locations = signal<Location[]>([]);
  private readonly _selectedLocation = signal<Location | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly locations = this._locations.asReadonly();
  readonly selectedLocation = this._selectedLocation.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todas las ubicaciones
   */
  getLocations(): Observable<Location[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Location[]>(`${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}`).pipe(
      map((locations) => this.roleFilter.filterLocations(locations)),
      tap((locations) => {
        this._locations.set(locations);
        this.logger.info('Ubicaciones cargadas', { count: locations.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar ubicaciones', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene ubicaciones por petId
   */
  getLocationsByPetId(petId: string): Observable<Location[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Location[]>(
      `${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}?petId=${petId}`
    ).pipe(
      tap((locations) => {
        this.logger.info('Ubicaciones cargadas para mascota', { petId, count: locations.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar ubicaciones por mascota', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene una ubicación por ID
   */
  getLocationById(id: string): Observable<Location | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Location>(`${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}/${id}`).pipe(
      tap((location) => {
        this._selectedLocation.set(location);
        this.logger.info('Ubicación cargada', { id: location.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar ubicación', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Crea una nueva ubicación
   */
  createLocation(locationData: CreateLocationRequest): Observable<Location | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<Location>(
      `${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}`,
      locationData
    ).pipe(
      tap((location) => {
        this._locations.update(locations => [...locations, location]);
        this.logger.info('Ubicación creada', { id: location.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al crear ubicación', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Actualiza una ubicación
   */
  updateLocation(id: string, locationData: UpdateLocationRequest): Observable<Location | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.patch<Location>(
      `${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}/${id}`,
      locationData
    ).pipe(
      tap((location) => {
        this._locations.update(locations => locations.map(l => l.id === id ? location : l));
        this._selectedLocation.set(location);
        this.logger.info('Ubicación actualizada', { id: location.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al actualizar ubicación', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Elimina una ubicación
   */
  deleteLocation(id: string): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}/${id}`).pipe(
      tap(() => {
        this._locations.update(locations => locations.filter(l => l.id !== id));
        if (this._selectedLocation()?.id === id) {
          this._selectedLocation.set(null);
        }
        this.logger.info('Ubicación eliminada', { id });
        this._isLoading.set(false);
      }),
      map(() => true),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al eliminar ubicación', errorInfo);
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una ubicación
   */
  selectLocation(location: Location | null): void {
    this._selectedLocation.set(location);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }
}

