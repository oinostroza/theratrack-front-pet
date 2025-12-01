import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { Pet, CreatePetRequest, UpdatePetRequest } from '../../../core/models/pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly roleFilter = inject(RoleFilterService);

  // Signals para estado reactivo
  private readonly _pets = signal<Pet[]>([]);
  private readonly _selectedPet = signal<Pet | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly pets = this._pets.asReadonly();
  readonly selectedPet = this._selectedPet.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todas las mascotas
   */
  getPets(): Observable<Pet[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Pet[]>(`${environment.apiUrl}${API_ENDPOINTS.PETS}`).pipe(
      map((pets) => this.roleFilter.filterPets(pets)),
      tap((pets) => {
        this._pets.set(pets);
        this.logger.info('Mascotas cargadas', { count: pets.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar mascotas', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene una mascota por ID
   */
  getPetById(id: string): Observable<Pet | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Pet>(`${environment.apiUrl}${API_ENDPOINTS.PETS}/${id}`).pipe(
      tap((pet) => {
        this._selectedPet.set(pet);
        this.logger.info('Mascota cargada', { id: pet.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar mascota', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Crea una nueva mascota
   */
  createPet(petData: CreatePetRequest): Observable<Pet | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<Pet>(`${environment.apiUrl}${API_ENDPOINTS.PETS}`, petData).pipe(
      tap((pet) => {
        this._pets.update(pets => [...pets, pet]);
        this.logger.info('Mascota creada', { id: pet.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al crear mascota', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Actualiza una mascota
   */
  updatePet(id: string, petData: UpdatePetRequest): Observable<Pet | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.patch<Pet>(`${environment.apiUrl}${API_ENDPOINTS.PETS}/${id}`, petData).pipe(
      tap((pet) => {
        this._pets.update(pets => pets.map(p => p.id === id ? pet : p));
        this._selectedPet.set(pet);
        this.logger.info('Mascota actualizada', { id: pet.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al actualizar mascota', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Elimina una mascota
   */
  deletePet(id: string): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.PETS}/${id}`).pipe(
      tap(() => {
        this._pets.update(pets => pets.filter(p => p.id !== id));
        if (this._selectedPet()?.id === id) {
          this._selectedPet.set(null);
        }
        this.logger.info('Mascota eliminada', { id });
        this._isLoading.set(false);
      }),
      map(() => true),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al eliminar mascota', errorInfo);
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una mascota
   */
  selectPet(pet: Pet | null): void {
    this._selectedPet.set(pet);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }
}

