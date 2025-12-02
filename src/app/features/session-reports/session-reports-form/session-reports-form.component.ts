import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SessionReportsService } from '../services/session-reports.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { PetsService } from '../../pets/services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-session-reports-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './session-reports-form.component.html',
  styleUrl: './session-reports-form.component.css'
})
export class SessionReportsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionReportsService = inject(SessionReportsService);
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly petsService = inject(PetsService);

  reportForm: FormGroup;
  readonly isLoading = this.sessionReportsService.isLoading;
  readonly error = this.sessionReportsService.error;
  readonly sessions = this.careSessionsService.sessions;
  readonly pets = this.petsService.pets;
  isEditMode = false;
  reportId: string | null = null;
  
  readonly DateUtil = DateUtil;

  constructor() {
    this.reportForm = this.fb.group({
      careSessionId: ['', [Validators.required]],
      activities: this.fb.array([this.fb.control('', Validators.required)]),
      notes: ['', [Validators.required]],
      mood: [''],
      feeding: this.fb.group({
        time: [''],
        amount: [''],
        foodType: ['']
      }),
      medication: this.fb.group({
        time: [''],
        medication: [''],
        dosage: ['']
      })
    });
  }

  ngOnInit(): void {
    this.reportId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.reportId;

    this.careSessionsService.getSessions().subscribe();
    this.petsService.getPets().subscribe();

    if (this.isEditMode && this.reportId) {
      this.sessionReportsService.getReportById(this.reportId).subscribe((report) => {
        if (report) {
          const activitiesArray = this.fb.array(
            report.activities.map(a => this.fb.control(a, Validators.required))
          );
          this.reportForm.setControl('activities', activitiesArray);
          this.reportForm.patchValue({
            careSessionId: report.careSessionId,
            notes: report.notes,
            mood: report.mood || '',
            feeding: report.feeding || { time: '', amount: '', foodType: '' },
            medication: report.medication || { time: '', medication: '', dosage: '' }
          });
        }
      });
    }
  }

  get activities(): FormArray {
    return this.reportForm.get('activities') as FormArray;
  }

  addActivity(): void {
    this.activities.push(this.fb.control('', Validators.required));
  }

  removeActivity(index: number): void {
    this.activities.removeAt(index);
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      this.markFormGroupTouched(this.reportForm);
      return;
    }

    const careSessionId = this.reportForm.value.careSessionId;
    if (!careSessionId) {
      return;
    }

    // Buscar la sesión seleccionada para obtener petId y sitterId
    const selectedSession = this.sessions().find(s => s.id === careSessionId);
    if (!selectedSession) {
      console.error('Sesión no encontrada');
      return;
    }

    // Preparar los datos del formulario
    const formValue: any = {
      ...this.reportForm.value,
      petId: selectedSession.petId,
      sitterId: selectedSession.sitterId,
      reportDate: new Date().toISOString(), // Fecha actual en formato ISO 8601
      activities: this.activities.value.filter((a: string) => a.trim() !== '')
    };

    // Limpiar objetos vacíos de feeding y medication
    // Si feeding está vacío o incompleto, no enviarlo
    if (formValue.feeding) {
      const feeding = formValue.feeding;
      if (!feeding.time && !feeding.amount && !feeding.foodType) {
        delete formValue.feeding;
      } else if (!feeding.time || !feeding.amount || !feeding.foodType) {
        // Si alguno de los campos está vacío, eliminar el objeto completo
        delete formValue.feeding;
      }
    }

    // Si medication está vacío o incompleto, no enviarlo
    if (formValue.medication) {
      const medication = formValue.medication;
      if (!medication.time && !medication.medication && !medication.dosage) {
        delete formValue.medication;
      } else if (!medication.time || !medication.medication || !medication.dosage) {
        // Si alguno de los campos está vacío, eliminar el objeto completo
        delete formValue.medication;
      }
    }

    if (this.isEditMode && this.reportId) {
      this.sessionReportsService.updateReport(this.reportId, formValue).subscribe((report) => {
        if (report) {
          this.router.navigate(['/session-reports', report.id]);
        }
      });
    } else {
      this.sessionReportsService.createReport(formValue).subscribe((report) => {
        if (report) {
          this.router.navigate(['/session-reports', report.id]);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get careSessionId() {
    return this.reportForm.get('careSessionId');
  }

  get notes() {
    return this.reportForm.get('notes');
  }

  getSessionDisplayText(session: any): string {
    const pet = this.pets().find(p => p.id === session.petId);
    const petName = pet?.name || 'Mascota desconocida';
    const date = DateUtil.formatDateShort(session.startTime);
    return `${petName} - ${date}`;
  }

  getSessionId(session: any): string {
    return session.id;
  }
}

