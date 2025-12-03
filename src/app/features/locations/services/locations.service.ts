import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { BaseService } from '../../../core/services/base.service';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { Location, CreateLocationRequest, UpdateLocationRequest } from '../../../core/models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationsService extends BaseService<Location> {
  private readonly http = inject(HttpClient);
  private readonly roleFilter = inject(RoleFilterService);

  protected getLogger(): LoggerService {
    return inject(LoggerService);
  }

  // Exponer signals con nombres específicos del dominio
  readonly locations = this.items;
  readonly selectedLocation = this.selectedItem;

  /**
   * Obtiene todas las ubicaciones
   */
  getLocations(): Observable<Location[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Location[]>(`${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}`).pipe(
      map((locations) => this.roleFilter.filterLocations(locations)),
      tap((locations) => {
        this._items.set(locations);
        this.logger.info('Ubicaciones cargadas', { count: locations.length });
      }),
      catchError((error) => this.handleError<Location[]>(error, 'cargar ubicaciones').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene ubicaciones por petId
   */
  getLocationsByPetId(petId: string): Observable<Location[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Location[]>(
      `${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}?petId=${petId}`
    ).pipe(
      tap((locations) => {
        this.logger.info('Ubicaciones cargadas para mascota', { petId, count: locations.length });
      }),
      catchError((error) => this.handleError<Location[]>(error, 'cargar ubicaciones por mascota').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene una ubicación por ID
   */
  getLocationById(id: string): Observable<Location | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Location>(`${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}/${id}`).pipe(
      tap((location) => {
        this.selectItem(location);
        this.logger.info('Ubicación cargada', { id: location.id });
      }),
      catchError((error) => this.handleError<Location | null>(error, 'cargar ubicación')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Crea una nueva ubicación
   */
  createLocation(locationData: CreateLocationRequest): Observable<Location | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<Location>(
      `${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}`,
      locationData
    ).pipe(
      tap((location) => {
        this.addItem(location);
        this.logger.info('Ubicación creada', { id: location.id });
      }),
      catchError((error) => this.handleError<Location | null>(error, 'crear ubicación')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Actualiza una ubicación
   */
  updateLocation(id: string, locationData: UpdateLocationRequest): Observable<Location | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.patch<Location>(
      `${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}/${id}`,
      locationData
    ).pipe(
      tap((location) => {
        this.updateItem(id, location, (l) => l.id);
        this.logger.info('Ubicación actualizada', { id: location.id });
      }),
      catchError((error) => this.handleError<Location | null>(error, 'actualizar ubicación')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Elimina una ubicación
   */
  deleteLocation(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.LOCATIONS}/${id}`).pipe(
      tap(() => {
        this.removeItem(id, (l) => l.id);
        this.logger.info('Ubicación eliminada', { id });
        this.setLoading(false);
      }),
      map(() => true),
      catchError((error) => {
        this.handleError<boolean>(error, 'eliminar ubicación');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una ubicación
   */
  selectLocation(location: Location | null): void {
    this.selectItem(location);
  }
}
