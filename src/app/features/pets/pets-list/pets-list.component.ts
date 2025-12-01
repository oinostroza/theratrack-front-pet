import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PetsService } from '../services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PetsFormComponent } from '../pets-form/pets-form.component';
import { PetsDetailComponent } from '../pets-detail/pets-detail.component';
import { PetAvatarComponent } from '../../../shared/components/pet-avatar/pet-avatar.component';
import { LastSessionComponent } from '../../../shared/components/last-session/last-session.component';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-pets-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingComponent, 
    ErrorDisplayComponent,
    ModalComponent,
    PetsFormComponent,
    PetsDetailComponent,
    PetAvatarComponent,
    LastSessionComponent
  ],
  templateUrl: './pets-list.component.html',
  styleUrl: './pets-list.component.css'
})
export class PetsListComponent implements OnInit {
  private readonly petsService = inject(PetsService);

  readonly pets = this.petsService.pets;
  readonly isLoading = this.petsService.isLoading;
  readonly error = this.petsService.error;

  // Estado del modal
  readonly showModal = signal<boolean>(false);
  readonly editingPet = signal<Pet | null>(null);
  
  // Estado de expansión de detalles
  readonly expandedPets = signal<Set<string>>(new Set());
  
  // Estado de carga para botones
  readonly loadingButtons = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.petsService.getPets().subscribe();
  }

  openNewModal(): void {
    this.editingPet.set(null);
    this.showModal.set(true);
  }

  openEditModal(pet: Pet): void {
    this.editingPet.set(pet);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingPet.set(null);
  }

  onPetSaved(): void {
    this.closeModal();
    // Recargar la lista
    this.petsService.getPets().subscribe();
  }

  togglePetDetails(petId: string): void {
    const expanded = new Set(this.expandedPets());
    
    // Si ya está expandido, solo colapsar
    if (expanded.has(petId)) {
      expanded.delete(petId);
      this.expandedPets.set(expanded);
      return;
    }

    // Si no está expandido, expandir y cargar datos
    expanded.add(petId);
    this.expandedPets.set(expanded);
    
    // Bloquear botón mientras carga
    const loading = new Set(this.loadingButtons());
    loading.add(petId);
    this.loadingButtons.set(loading);

    // Cargar datos del pet
    this.petsService.getPetById(petId).subscribe({
      next: () => {
        // Simular un pequeño delay para mostrar el spinner
        setTimeout(() => {
          loading.delete(petId);
          this.loadingButtons.set(loading);
        }, 300);
      },
      error: () => {
        loading.delete(petId);
        this.loadingButtons.set(loading);
      }
    });
  }

  isPetExpanded(petId: string): boolean {
    return this.expandedPets().has(petId);
  }

  isButtonLoading(petId: string): boolean {
    return this.loadingButtons().has(petId);
  }
}

