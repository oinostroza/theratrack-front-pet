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
  readonly showDetailModal = signal<boolean>(false);
  readonly editingPet = signal<Pet | null>(null);
  readonly selectedPet = signal<Pet | null>(null);

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

  openDetailModal(pet: Pet): void {
    this.selectedPet.set(pet);
    this.petsService.getPetById(pet.id).subscribe(() => {
      this.showDetailModal.set(true);
    });
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedPet.set(null);
  }
}

