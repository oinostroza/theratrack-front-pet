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
import { getPhotoUrl } from '../../../core/utils/photo.util';

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
  readonly availablePhotos = signal<Photo[]>([]);
  readonly selectedPhotoId = signal<string | null>(null);
  readonly isLoadingPhotos = signal<boolean>(false);

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

  openModal(): void {
    this.openNewModal();
  }

  getPhotoUrl = getPhotoUrl;

  onAvatarClick(pet: Pet): void {
    this.petForPhoto.set(pet);
    this.selectedPhotoId.set(null);
    this.showPhotoModal.set(true);
    // Cargar fotos disponibles del pet
    this.loadAvailablePhotos(pet.id);
  }

  closePhotoModal(): void {
    this.showPhotoModal.set(false);
    this.petForPhoto.set(null);
    this.selectedPhotoId.set(null);
    this.availablePhotos.set([]);
  }

  loadAvailablePhotos(petId: string): void {
    this.isLoadingPhotos.set(true);
    this.photosService.getPhotosByPetId(petId).subscribe({
      next: (photos) => {
        this.availablePhotos.set(photos);
        this.isLoadingPhotos.set(false);
      },
      error: () => {
        this.isLoadingPhotos.set(false);
      }
    });
  }

  selectExistingPhoto(photo: Photo): void {
    this.selectedPhotoId.set(photo.id);
  }

  onPhotoUploaded(photo: Photo): void {
    const pet = this.petForPhoto();
    if (pet && photo && photo.url) {
      // Agregar la nueva foto a la lista de fotos disponibles
      this.availablePhotos.update(photos => [...photos, photo]);
      
      // Actualizar la mascota con la nueva foto como avatar
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

  saveSelectedPhoto(): void {
    const pet = this.petForPhoto();
    const selectedId = this.selectedPhotoId();
    
    if (!pet) return;

    // Si se seleccionó una foto existente
    if (selectedId) {
      const selectedPhoto = this.availablePhotos().find(p => p.id === selectedId);
      if (selectedPhoto && selectedPhoto.url) {
        this.petsService.updatePet(pet.id, { photoUrl: selectedPhoto.url }).subscribe({
          next: () => {
            this.closePhotoModal();
            this.petsService.getPets().subscribe();
          },
          error: (error) => {
            console.error('Error al actualizar foto:', error);
          }
        });
      }
    }
  }
}

