import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SessionReportsService } from '../services/session-reports.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-session-reports-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './session-reports-detail.component.html',
  styleUrl: './session-reports-detail.component.css'
})
export class SessionReportsDetailComponent implements OnInit, OnChanges {
  @Input() reportId?: string;
  @Input() isModal: boolean = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionReportsService = inject(SessionReportsService);

  readonly selectedReport = this.sessionReportsService.selectedReport;
  readonly isLoading = this.sessionReportsService.isLoading;
  readonly error = this.sessionReportsService.error;

  readonly DateUtil = DateUtil;

  getMoodEmoji(mood?: string): string {
    const moodMap: Record<string, string> = {
      'happy': '😊',
      'calm': '😌',
      'anxious': '😰',
      'playful': '😄',
      'tired': '😴'
    };
    return moodMap[mood || ''] || '📊';
  }

  ngOnInit(): void {
    const reportId = this.reportId || this.route.snapshot.paramMap.get('id');
    if (reportId) {
      this.sessionReportsService.getReportById(reportId).subscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportId'] && this.reportId) {
      this.sessionReportsService.getReportById(this.reportId).subscribe();
    }
  }

  deleteReport(): void {
    const report = this.selectedReport();
    if (report && confirm(`¿Estás seguro de eliminar este reporte?`)) {
      this.sessionReportsService.deleteReport(report.id).subscribe((success) => {
        if (success) {
          this.router.navigate(['/session-reports']);
        }
      });
    }
  }
}

