import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { AuthService } from '../../../core/services/auth.service';
import { PetsService } from '../../pets/services/pets.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { Photo, CreatePhotoRequest, UpdatePhotoRequest } from '../../../core/models/photo.model';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly roleFilter = inject(RoleFilterService);
  private readonly authService = inject(AuthService);
  private readonly petsService = inject(PetsService);
  private readonly careSessionsService = inject(CareSessionsService);

  // Signals para estado reactivo
  private readonly _photos = signal<Photo[]>([]);
  private readonly _selectedPhoto = signal<Photo | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly photos = this._photos.asReadonly();
  readonly selectedPhoto = this._selectedPhoto.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todas las fotos
   */
  getPhotos(): Observable<Photo[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Photo[]>(`${environment.apiUrl}${API_ENDPOINTS.PHOTOS}`).pipe(
      map((photos) => {
        const user = this.roleFilter.getCurrentUser();
        if (user?.role === 'owner') {
          const ownerPets = this.petsService.pets();
          const ownerPetIds = ownerPets.map(pet => pet.id.toString());
          return this.roleFilter.filterPhotos(photos, ownerPetIds);
        } else if (user?.role === 'sitter') {
          const sitterSessions = this.careSessionsService.sessions();
          const sitterSessionIds = sitterSessions.map(session => session.id.toString());
          return this.roleFilter.filterPhotos(photos, undefined, sitterSessionIds);
        }
        return this.roleFilter.filterPhotos(photos);
      }),
      tap((photos) => {
        this._photos.set(photos);
        this.logger.info('Fotos cargadas', { count: photos.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar fotos', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene fotos por petId
   */
  getPhotosByPetId(petId: string): Observable<Photo[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Photo[]>(
      `${environment.apiUrl}${API_ENDPOINTS.PHOTOS}?petId=${petId}`
    ).pipe(
      tap((photos) => {
        this.logger.info('Fotos cargadas para mascota', { petId, count: photos.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar fotos por mascota', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene fotos por careSessionId
   */
  getPhotosBySessionId(careSessionId: string): Observable<Photo[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Photo[]>(
      `${environment.apiUrl}${API_ENDPOINTS.PHOTOS}?careSessionId=${careSessionId}`
    ).pipe(
      tap((photos) => {
        this.logger.info('Fotos cargadas para sesión', { careSessionId, count: photos.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar fotos por sesión', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene una foto por ID
   */
  getPhotoById(id: string): Observable<Photo | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Photo>(`${environment.apiUrl}${API_ENDPOINTS.PHOTOS}/${id}`).pipe(
      tap((photo) => {
        this._selectedPhoto.set(photo);
        this.logger.info('Foto cargada', { id: photo.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar foto', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Sube una nueva foto
   */
  uploadPhoto(photoData: CreatePhotoRequest): Observable<Photo | null> {
    this._isLoading.set(true);
    this._error.set(null);

    const user = this.authService.user();
    if (!user || !user.id) {
      this._error.set('Usuario no autenticado');
      this._isLoading.set(false);
      return of(null);
    }

    const formData = new FormData();
    formData.append('file', photoData.file);
    formData.append('uploadedBy', user.id.toString()); // Campo requerido por el backend
    if (photoData.petId) formData.append('petId', photoData.petId);
    if (photoData.careSessionId) formData.append('careSessionId', photoData.careSessionId);
    if (photoData.sessionReportId) formData.append('sessionReportId', photoData.sessionReportId);
    if (photoData.description) formData.append('description', photoData.description);
    if (photoData.tags) formData.append('tags', JSON.stringify(photoData.tags));

    return this.http.post<Photo>(`${environment.apiUrl}${API_ENDPOINTS.PHOTOS}`, formData).pipe(
      tap((photo) => {
        this._photos.update(photos => [...photos, photo]);
        this.logger.info('Foto subida', { id: photo.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al subir foto', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Actualiza una foto
   */
  updatePhoto(id: string, photoData: UpdatePhotoRequest): Observable<Photo | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.patch<Photo>(
      `${environment.apiUrl}${API_ENDPOINTS.PHOTOS}/${id}`,
      photoData
    ).pipe(
      tap((photo) => {
        this._photos.update(photos => photos.map(p => p.id === id ? photo : p));
        this._selectedPhoto.set(photo);
        this.logger.info('Foto actualizada', { id: photo.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al actualizar foto', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Elimina una foto
   */
  deletePhoto(id: string): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.PHOTOS}/${id}`).pipe(
      tap(() => {
        this._photos.update(photos => photos.filter(p => p.id !== id));
        if (this._selectedPhoto()?.id === id) {
          this._selectedPhoto.set(null);
        }
        this.logger.info('Foto eliminada', { id });
        this._isLoading.set(false);
      }),
      map(() => true),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al eliminar foto', errorInfo);
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una foto
   */
  selectPhoto(photo: Photo | null): void {
    this._selectedPhoto.set(photo);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }
}

