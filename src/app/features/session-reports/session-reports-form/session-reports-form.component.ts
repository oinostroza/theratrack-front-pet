import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SessionReportsService } from '../services/session-reports.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';

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

  reportForm: FormGroup;
  readonly isLoading = this.sessionReportsService.isLoading;
  readonly error = this.sessionReportsService.error;
  readonly sessions = this.careSessionsService.sessions;
  isEditMode = false;
  reportId: string | null = null;

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

    const formValue = {
      ...this.reportForm.value,
      activities: this.activities.value.filter((a: string) => a.trim() !== '')
    };

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
}

