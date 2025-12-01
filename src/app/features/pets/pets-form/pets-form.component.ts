import { Component, OnInit, inject, Input, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetsService } from '../services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';
import { Pet } from '../../../core/models/pet.model';

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

  @Input() pet?: Pet | null = null;
  @Input() isModal: boolean = false;
  @Output() saved = new EventEmitter<Pet>();
  @Output() cancelled = new EventEmitter<void>();

  petForm: FormGroup;
  readonly isLoading = this.petsService.isLoading;
  readonly error = this.petsService.error;
  isEditMode = false;
  petId: string | null = null;
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

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
        this.petsService.getPetById(this.petId).subscribe((pet) => {
          if (pet) {
            this.loadPetData(pet);
          }
        });
      }
    } else {
      // Si es modal y hay pet, es edición
      if (this.pet) {
        this.isEditMode = true;
        this.petId = this.pet.id;
        this.loadPetData(this.pet);
      }
    }
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
  }

  onPhotoSelected(file: File): void {
    this.selectedPhoto = file;
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      this.markFormGroupTouched(this.petForm);
      return;
    }

    const formValue = this.petForm.value;

    // Si hay foto seleccionada, subirla primero
    if (this.selectedPhoto) {
      // TODO: Implementar subida de foto
      // Por ahora, usar una URL temporal
      formValue.photoUrl = this.photoPreview || '';
    }

    if (this.isEditMode && this.petId) {
      this.petsService.updatePet(this.petId, formValue).subscribe((pet) => {
        if (pet) {
          if (this.isModal) {
            this.saved.emit(pet);
          } else {
            this.router.navigate(['/pets', pet.id]);
          }
        }
      });
    } else {
      this.petsService.createPet(formValue).subscribe((pet) => {
        if (pet) {
          if (this.isModal) {
            this.saved.emit(pet);
          } else {
            this.router.navigate(['/pets', pet.id]);
          }
        }
      });
    }
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

