import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CareSessionsService } from '../services/care-sessions.service';
import { PetsService } from '../../pets/services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-care-sessions-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './care-sessions-form.component.html',
  styleUrl: './care-sessions-form.component.css'
})
export class CareSessionsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly petsService = inject(PetsService);

  sessionForm: FormGroup;
  readonly isLoading = this.careSessionsService.isLoading;
  readonly error = this.careSessionsService.error;
  readonly pets = this.petsService.pets;
  isEditMode = false;
  sessionId: string | null = null;

  readonly DateUtil = DateUtil;

  constructor() {
    this.sessionForm = this.fb.group({
      petId: ['', [Validators.required]],
      sitterId: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: [''],
      status: ['scheduled', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.sessionId;

    // Cargar mascotas
    this.petsService.getPets().subscribe();

    if (this.isEditMode && this.sessionId) {
      this.careSessionsService.getSessionById(this.sessionId).subscribe((session) => {
        if (session) {
          this.sessionForm.patchValue({
            petId: session.petId,
            sitterId: session.sitterId,
            startTime: new Date(session.startTime).toISOString().slice(0, 16),
            endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
            status: session.status,
            notes: session.notes || ''
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      this.markFormGroupTouched(this.sessionForm);
      return;
    }

    const formValue = this.sessionForm.value;

    if (this.isEditMode && this.sessionId) {
      this.careSessionsService.updateSession(this.sessionId, formValue).subscribe((session) => {
        if (session) {
          this.router.navigate(['/care-sessions', session.id]);
        }
      });
    } else {
      this.careSessionsService.createSession(formValue).subscribe((session) => {
        if (session) {
          this.router.navigate(['/care-sessions', session.id]);
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

  get petId() {
    return this.sessionForm.get('petId');
  }

  get sitterId() {
    return this.sessionForm.get('sitterId');
  }

  get startTime() {
    return this.sessionForm.get('startTime');
  }

  get endTime() {
    return this.sessionForm.get('endTime');
  }

  get status() {
    return this.sessionForm.get('status');
  }
}

