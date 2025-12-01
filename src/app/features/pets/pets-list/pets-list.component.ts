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
    PetAvatarComponent
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
    if (expanded.has(petId)) {
      expanded.delete(petId);
    } else {
      expanded.add(petId);
      // Cargar datos del pet si no están cargados
      this.petsService.getPetById(petId).subscribe();
    }
    this.expandedPets.set(expanded);
  }

  isPetExpanded(petId: string): boolean {
    return this.expandedPets().has(petId);
  }
}

