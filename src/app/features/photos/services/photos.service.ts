import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, from, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { BaseService } from '../../../core/services/base.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { AuthService } from '../../../core/services/auth.service';
import { PhotoStorageService } from '../../../core/services/photo-storage.service';
import { PetsService } from '../../pets/services/pets.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { Photo, CreatePhotoRequest, UpdatePhotoRequest } from '../../../core/models/photo.model';

@Injectable({
  providedIn: 'root'
})
export class PhotosService extends BaseService<Photo> {
  private readonly http = inject(HttpClient);
  private readonly roleFilter = inject(RoleFilterService);
  private readonly authService = inject(AuthService);
  private readonly petsService = inject(PetsService);
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly photoStorage = inject(PhotoStorageService);

  protected getLogger(): LoggerService {
    return inject(LoggerService);
  }

  // Exponer signals con nombres específicos del dominio
  readonly photos = this.items;
  readonly selectedPhoto = this.selectedItem;

  /**
   * Obtiene todas las fotos
   */
  getPhotos(): Observable<Photo[]> {
    this.setLoading(true);
    this.clearError();

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
        this._items.set(photos);
        this.logger.info('Fotos cargadas', { count: photos.length });
      }),
      catchError((error) => this.handleError<Photo[]>(error, 'cargar fotos').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene fotos por petId
   */
  getPhotosByPetId(petId: string): Observable<Photo[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Photo[]>(
      `${environment.apiUrl}${API_ENDPOINTS.PHOTOS}?petId=${petId}`
    ).pipe(
      tap((photos) => {
        this.logger.info('Fotos cargadas para mascota', { petId, count: photos.length });
      }),
      catchError((error) => this.handleError<Photo[]>(error, 'cargar fotos por mascota').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene fotos por careSessionId
   */
  getPhotosBySessionId(careSessionId: string): Observable<Photo[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Photo[]>(
      `${environment.apiUrl}${API_ENDPOINTS.PHOTOS}?careSessionId=${careSessionId}`
    ).pipe(
      tap((photos) => {
        this.logger.info('Fotos cargadas para sesión', { careSessionId, count: photos.length });
      }),
      catchError((error) => this.handleError<Photo[]>(error, 'cargar fotos por sesión').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene una foto por ID
   */
  getPhotoById(id: string): Observable<Photo | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Photo>(`${environment.apiUrl}${API_ENDPOINTS.PHOTOS}/${id}`).pipe(
      tap((photo) => {
        this.selectItem(photo);
        this.logger.info('Foto cargada', { id: photo.id });
      }),
      catchError((error) => this.handleError<Photo | null>(error, 'cargar foto')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Sube una nueva foto
   * Guarda el archivo localmente y envía los metadatos al backend
   */
  uploadPhoto(photoData: CreatePhotoRequest): Observable<Photo | null> {
    this.setLoading(true);
    this.clearError();

    const user = this.authService.user();
    if (!user || !user.id) {
      this._error.set('Usuario no autenticado');
      this.setLoading(false);
      return of(null);
    }

    // Convertir user.id a número si es string
    const uploadedById = typeof user.id === 'string' ? parseInt(user.id, 10) : Number(user.id);
    if (isNaN(uploadedById)) {
      this._error.set('ID de usuario inválido');
      this.setLoading(false);
      return of(null);
    }

    // Determinar la carpeta: 'avatars' si es para un pet sin careSessionId, 'sessions' si tiene careSessionId
    const folder: 'avatars' | 'sessions' = photoData.folder || (photoData.careSessionId ? 'sessions' : 'avatars');

    // Guardar archivo localmente primero
    return from(this.photoStorage.savePhoto(photoData.file, folder)).pipe(
      switchMap((filename) => {
        // Enviar metadatos al backend
        const createPhotoDto = {
          filename: filename,
          folder: folder,
          uploadedBy: uploadedById,
          petId: photoData.petId,
          careSessionId: photoData.careSessionId,
          sessionReportId: photoData.sessionReportId,
          description: photoData.description,
          tags: photoData.tags
        };

        return this.http.post<Photo>(`${environment.apiUrl}${API_ENDPOINTS.PHOTOS}`, createPhotoDto).pipe(
          tap((photo) => {
            this.addItem(photo);
            this.logger.info('Foto subida y guardada localmente', { id: photo.id, filename });
          }),
          catchError((error) => {
            // Si falla el backend, eliminar el archivo local
            this.photoStorage.deletePhoto(filename, folder).catch(err => 
              this.logger.error('Error al eliminar foto local después de fallo', err)
            );
            return this.handleError<Photo | null>(error, 'subir foto');
          })
        );
      }),
      catchError((error) => this.handleError<Photo | null>(error, 'guardar foto localmente')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Actualiza una foto
   */
  updatePhoto(id: string, photoData: UpdatePhotoRequest): Observable<Photo | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.patch<Photo>(
      `${environment.apiUrl}${API_ENDPOINTS.PHOTOS}/${id}`,
      photoData
    ).pipe(
      tap((photo) => {
        this.updateItem(id, photo, (p) => p.id);
        this.logger.info('Foto actualizada', { id: photo.id });
      }),
      catchError((error) => this.handleError<Photo | null>(error, 'actualizar foto')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Elimina una foto
   */
  deletePhoto(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.PHOTOS}/${id}`).pipe(
      tap(() => {
        this.removeItem(id, (p) => p.id);
        this.logger.info('Foto eliminada', { id });
        this.setLoading(false);
      }),
      map(() => true),
      catchError((error) => {
        this.handleError<boolean>(error, 'eliminar foto');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una foto
   */
  selectPhoto(photo: Photo | null): void {
    this.selectItem(photo);
  }
}

