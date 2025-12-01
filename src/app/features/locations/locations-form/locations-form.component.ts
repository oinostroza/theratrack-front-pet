import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationsService } from '../services/locations.service';
import { PetsService } from '../../pets/services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';

@Component({
  selector: 'app-locations-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './locations-form.component.html',
  styleUrl: './locations-form.component.css'
})
export class LocationsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly locationsService = inject(LocationsService);
  private readonly petsService = inject(PetsService);

  locationForm: FormGroup;
  readonly isLoading = this.locationsService.isLoading;
  readonly error = this.locationsService.error;
  readonly pets = this.petsService.pets;
  isEditMode = false;
  locationId: string | null = null;

  constructor() {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      latitude: [0, [Validators.required]],
      longitude: [0, [Validators.required]],
      petId: [''],
      type: ['other', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.locationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.locationId;

    this.petsService.getPets().subscribe();

    if (this.isEditMode && this.locationId) {
      this.locationsService.getLocationById(this.locationId).subscribe((location) => {
        if (location) {
          this.locationForm.patchValue({
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            petId: location.petId || '',
            type: location.type,
            notes: location.notes || ''
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.markFormGroupTouched(this.locationForm);
      return;
    }

    const formValue = this.locationForm.value;

    if (this.isEditMode && this.locationId) {
      this.locationsService.updateLocation(this.locationId, formValue).subscribe((location) => {
        if (location) {
          this.router.navigate(['/locations', location.id]);
        }
      });
    } else {
      this.locationsService.createLocation(formValue).subscribe((location) => {
        if (location) {
          this.router.navigate(['/locations', location.id]);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get name() { return this.locationForm.get('name'); }
  get address() { return this.locationForm.get('address'); }
  get latitude() { return this.locationForm.get('latitude'); }
  get longitude() { return this.locationForm.get('longitude'); }
  get type() { return this.locationForm.get('type'); }
}

