import { Component, OnInit, inject, Input, Output, EventEmitter, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetsService } from '../services/pets.service';
import { PhotosService } from '../../photos/services/photos.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';
import { Pet } from '../../../core/models/pet.model';
import { Photo } from '../../../core/models/photo.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pets-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    LoadingComponent, 
    ErrorDisplayComponent,
    PhotoUploadComponent
  ],
  templateUrl: './pets-form.component.html',
  styleUrl: './pets-form.component.css'
})
export class PetsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly petsService = inject(PetsService);
  private readonly photosService = inject(PhotosService);

  @Input() pet?: Pet | null = null;
  @Input() isModal: boolean = false;
  @Output() saved = new EventEmitter<Pet>();
  @Output() cancelled = new EventEmitter<void>();

  petForm: FormGroup;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  isEditMode = false;
  petId: string | null = null;
  selectedPhoto: File | null = null;
  selectedPhotoId: string | null = null;
  photoPreview: string | null = null;
  availablePhotos = signal<Photo[]>([]);
  showPhotoSelector = signal(false);

  constructor() {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      species: ['', [Validators.required]],
      breed: [''],
      age: [null, [Validators.min(0), Validators.max(30)]],
      photoUrl: ['']
    });

    // Efecto para cargar datos cuando se pasa un pet como Input
    effect(() => {
      if (this.pet) {
        this.loadPetData(this.pet);
      }
    });
  }

  ngOnInit(): void {
    // Si no es modal, usar ruta
    if (!this.isModal) {
      this.petId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.petId;

      if (this.isEditMode && this.petId) {
        this.loadPetAndPhotos(this.petId);
      }
    } else {
      // Si es modal y hay pet, es edición
      if (this.pet) {
        this.isEditMode = true;
        this.petId = this.pet.id;
        this.loadPetData(this.pet);
        this.loadAvailablePhotos();
      }
    }
  }

  private loadPetAndPhotos(petId: string): void {
    forkJoin({
      pet: this.petsService.getPetById(petId),
      photos: this.photosService.getPhotos()
    }).subscribe({
      next: ({ pet, photos }) => {
        if (pet) {
          this.loadPetData(pet);
        }
        this.availablePhotos.set(photos);
      },
      error: (error) => {
        this.error.set('Error al cargar datos');
        console.error(error);
      }
    });
  }

  private loadAvailablePhotos(): void {
    this.photosService.getPhotos().subscribe({
      next: (photos) => {
        this.availablePhotos.set(photos);
      },
      error: (error) => {
        console.error('Error al cargar fotos', error);
      }
    });
  }

  private loadPetData(pet: Pet): void {
    this.isEditMode = true;
    this.petId = pet.id;
    this.petForm.patchValue({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age || null,
      photoUrl: pet.photoUrl || ''
    });
    if (pet.photoUrl) {
      this.photoPreview = pet.photoUrl;
    }
    // Cargar fotos disponibles
    this.loadAvailablePhotos();
  }

  onPhotoSelected(file: File): void {
    this.selectedPhoto = file;
    this.selectedPhotoId = null; // Limpiar selección de foto existente
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onExistingPhotoSelected(photo: Photo): void {
    this.selectedPhotoId = photo.id;
    this.selectedPhoto = null; // Limpiar archivo seleccionado
    this.photoPreview = photo.url || photo.thumbnailUrl || null;
    this.showPhotoSelector.set(false);
  }

  togglePhotoSelector(): void {
    this.showPhotoSelector.update(value => !value);
  }

  onSubmit(): void {
    if (this.petForm.invalid && !this.isEditMode) {
      this.markFormGroupTouched(this.petForm);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // En modo edición, solo actualizamos la foto
    if (this.isEditMode && this.petId) {
      this.updatePetPhoto();
    } else {
      // En modo creación, creamos la mascota con todos los datos
      const formValue = this.petForm.value;
      
      // Si hay foto seleccionada, subirla primero
      if (this.selectedPhoto) {
        this.uploadPhotoAndCreatePet(formValue);
      } else if (this.selectedPhotoId) {
        // Si se seleccionó una foto existente, usar su URL
        const selectedPhoto = this.availablePhotos().find(p => p.id === this.selectedPhotoId);
        if (selectedPhoto) {
          formValue.photoUrl = selectedPhoto.url;
        }
        this.createPet(formValue);
      } else {
        this.createPet(formValue);
      }
    }
  }

  private updatePetPhoto(): void {
    if (this.selectedPhoto) {
      // Subir nueva foto y asociarla a la mascota
      const photoData = {
        file: this.selectedPhoto,
        petId: this.petId!,
        description: `Avatar de ${this.petForm.get('name')?.value || 'mascota'}`
      };

      this.photosService.uploadPhoto(photoData).subscribe({
        next: (photo) => {
          if (photo) {
            // Actualizar mascota con la URL de la foto
            this.petsService.updatePet(this.petId!, { photoUrl: photo.url }).subscribe({
              next: (pet) => {
                if (pet) {
                  this.isLoading.set(false);
                  if (this.isModal) {
                    this.saved.emit(pet);
                  } else {
                    this.router.navigate(['/pets', pet.id]);
                  }
                }
              },
              error: (error) => {
                this.isLoading.set(false);
                this.error.set('Error al actualizar mascota');
                console.error(error);
              }
            });
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Error al subir foto');
          console.error(error);
        }
      });
    } else if (this.selectedPhotoId) {
      // Usar foto existente
      const selectedPhoto = this.availablePhotos().find(p => p.id === this.selectedPhotoId);
      if (selectedPhoto) {
        this.petsService.updatePet(this.petId!, { photoUrl: selectedPhoto.url }).subscribe({
          next: (pet) => {
            if (pet) {
              this.isLoading.set(false);
              if (this.isModal) {
                this.saved.emit(pet);
              } else {
                this.router.navigate(['/pets', pet.id]);
              }
            }
          },
          error: (error) => {
            this.isLoading.set(false);
            this.error.set('Error al actualizar mascota');
            console.error(error);
          }
        });
      }
    } else {
      this.isLoading.set(false);
      this.error.set('Por favor selecciona o sube una foto');
    }
  }

  private uploadPhotoAndCreatePet(formValue: any): void {
    const photoData = {
      file: this.selectedPhoto!,
      petId: undefined, // Se asociará después de crear la mascota
      description: `Foto de ${formValue.name}`
    };

    this.photosService.uploadPhoto(photoData).subscribe({
      next: (photo) => {
        if (photo) {
          formValue.photoUrl = photo.url;
          this.createPet(formValue);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set('Error al subir foto');
        console.error(error);
      }
    });
  }

  private createPet(formValue: any): void {
    this.petsService.createPet(formValue).subscribe({
      next: (pet) => {
        if (pet) {
          this.isLoading.set(false);
          if (this.isModal) {
            this.saved.emit(pet);
          } else {
            this.router.navigate(['/pets', pet.id]);
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set('Error al crear mascota');
        console.error(error);
      }
    });
  }

  onCancel(): void {
    if (this.isModal) {
      this.cancelled.emit();
    } else {
      this.router.navigate(['/pets']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get name() {
    return this.petForm.get('name');
  }

  get species() {
    return this.petForm.get('species');
  }

  get breed() {
    return this.petForm.get('breed');
  }

  get age() {
    return this.petForm.get('age');
  }
}

