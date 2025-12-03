import { Observable } from 'rxjs';
import { Pet, CreatePetRequest, UpdatePetRequest } from '../models/pet.model';

/**
 * Interfaz para el servicio de mascotas
 * Implementa Dependency Inversion Principle (DIP)
 */
export interface IPetsService {
  readonly pets: Readonly<{ (): Pet[] }>;
  readonly selectedPet: Readonly<{ (): Pet | null }>;
  readonly isLoading: Readonly<{ (): boolean }>;
  readonly error: Readonly<{ (): string | null }>;

  getPets(): Observable<Pet[]>;
  getPetsByOwnerId(ownerId: number | string): Observable<Pet[]>;
  getPetById(id: string): Observable<Pet | null>;
  createPet(petData: CreatePetRequest): Observable<Pet | null>;
  updatePet(id: string, petData: UpdatePetRequest): Observable<Pet | null>;
  deletePet(id: string): Observable<boolean>;
  selectPet(pet: Pet | null): void;
  clearError(): void;
}

