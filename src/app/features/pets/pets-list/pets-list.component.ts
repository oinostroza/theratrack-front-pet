import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PetsService } from '../services/pets.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { PhotosService } from '../../photos/services/photos.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PetsFormComponent } from '../pets-form/pets-form.component';
import { PetAvatarComponent } from '../../../shared/components/pet-avatar/pet-avatar.component';
import { LastSessionComponent } from '../../../shared/components/last-session/last-session.component';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';
import { Pet } from '../../../core/models/pet.model';
import { Photo } from '../../../core/models/photo.model';

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
    PetAvatarComponent,
    LastSessionComponent,
    PhotoUploadComponent
  ],
  templateUrl: './pets-list.component.html',
  styleUrl: './pets-list.component.css'
})
export class PetsListComponent implements OnInit {
  private readonly petsService = inject(PetsService);
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly photosService = inject(PhotosService);

  readonly pets = this.petsService.pets;
  readonly isLoading = this.petsService.isLoading;
  readonly error = this.petsService.error;

  // Estado del modal
  readonly showModal = signal<boolean>(false);
  readonly editingPet = signal<Pet | null>(null);
  
  // Estado del modal de foto
  readonly showPhotoModal = signal<boolean>(false);
  readonly petForPhoto = signal<Pet | null>(null);
  

  ngOnInit(): void {
    // Cargar mascotas y sesiones de una vez para que LastSessionComponent pueda usar el caché
    // Similar a como funciona en owners-list
    forkJoin({
      pets: this.petsService.getPets(),
      sessions: this.careSessionsService.getSessions()
    }).subscribe({
      next: () => {
        // Datos cargados, LastSessionComponent usará el caché
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
      }
    });
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


  onAvatarClick(pet: Pet): void {
    this.petForPhoto.set(pet);
    this.showPhotoModal.set(true);
  }

  closePhotoModal(): void {
    this.showPhotoModal.set(false);
    this.petForPhoto.set(null);
  }

  onPhotoUploaded(photo: Photo): void {
    const pet = this.petForPhoto();
    if (pet && photo && photo.url) {
      // Actualizar la mascota con la nueva foto
      this.petsService.updatePet(pet.id, { photoUrl: photo.url }).subscribe({
        next: () => {
          this.closePhotoModal();
          // Recargar la lista para mostrar la nueva foto
          this.petsService.getPets().subscribe();
        },
        error: (error) => {
          console.error('Error al actualizar foto:', error);
        }
      });
    }
  }
}

