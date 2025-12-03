import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { BaseService } from '../../../core/services/base.service';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { Pet, CreatePetRequest, UpdatePetRequest } from '../../../core/models/pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetsService extends BaseService<Pet> {
  private readonly http = inject(HttpClient);
  private readonly roleFilter = inject(RoleFilterService);

  protected getLogger(): LoggerService {
    return inject(LoggerService);
  }

  // Exponer signals con nombres específicos del dominio
  readonly pets = this.items;
  readonly selectedPet = this.selectedItem;

  /**
   * Obtiene todas las mascotas
   */
  getPets(): Observable<Pet[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Pet[]>(`${environment.apiUrl}${API_ENDPOINTS.PETS}`).pipe(
      map((pets) => this.roleFilter.filterPets(pets)),
      tap((pets) => {
        this._items.set(pets);
        this.logger.info('Mascotas cargadas', { count: pets.length });
      }),
      catchError((error) => this.handleError<Pet[]>(error, 'cargar mascotas').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene mascotas por ownerId
   */
  getPetsByOwnerId(ownerId: number | string): Observable<Pet[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Pet[]>(`${environment.apiUrl}${API_ENDPOINTS.PETS}?ownerId=${ownerId}`).pipe(
      map((pets) => this.roleFilter.filterPets(pets)),
      tap((pets) => {
        this.logger.info('Mascotas cargadas para dueño', { ownerId, count: pets.length });
      }),
      catchError((error) => this.handleError<Pet[]>(error, 'cargar mascotas por dueño').pipe(map(() => []))),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene una mascota por ID
   */
  getPetById(id: string): Observable<Pet | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<Pet>(`${environment.apiUrl}${API_ENDPOINTS.PETS}/${id}`).pipe(
      tap((pet) => {
        this.selectItem(pet);
        this.logger.info('Mascota cargada', { id: pet.id });
      }),
      catchError((error) => this.handleError<Pet | null>(error, 'cargar mascota')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Crea una nueva mascota
   */
  createPet(petData: CreatePetRequest): Observable<Pet | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<Pet>(`${environment.apiUrl}${API_ENDPOINTS.PETS}`, petData).pipe(
      tap((pet) => {
        this.addItem(pet);
        this.logger.info('Mascota creada', { id: pet.id });
      }),
      catchError((error) => this.handleError<Pet | null>(error, 'crear mascota')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Actualiza una mascota
   */
  updatePet(id: string, petData: UpdatePetRequest): Observable<Pet | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.patch<Pet>(`${environment.apiUrl}${API_ENDPOINTS.PETS}/${id}`, petData).pipe(
      tap((pet) => {
        this.updateItem(id, pet, (p) => p.id);
        this.logger.info('Mascota actualizada', { id: pet.id });
      }),
      catchError((error) => this.handleError<Pet | null>(error, 'actualizar mascota')),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Elimina una mascota
   */
  deletePet(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.PETS}/${id}`).pipe(
      tap(() => {
        this.removeItem(id, (p) => p.id);
        this.logger.info('Mascota eliminada', { id });
        this.setLoading(false);
      }),
      map(() => true),
      catchError((error) => {
        this.handleError<boolean>(error, 'eliminar mascota');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona una mascota
   */
  selectPet(pet: Pet | null): void {
    this.selectItem(pet);
  }
}

