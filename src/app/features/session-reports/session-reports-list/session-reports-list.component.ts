import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionReportsService } from '../services/session-reports.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { SessionReportsDetailComponent } from '../session-reports-detail/session-reports-detail.component';
import { DateUtil } from '../../../core/utils/date.util';
import { SessionReport } from '../../../core/models/session-report.model';

@Component({
  selector: 'app-session-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, SessionReportsDetailComponent],
  templateUrl: './session-reports-list.component.html',
  styleUrl: './session-reports-list.component.css'
})
export class SessionReportsListComponent implements OnInit {
  private readonly sessionReportsService = inject(SessionReportsService);

  readonly reports = this.sessionReportsService.reports;
  readonly isLoading = this.sessionReportsService.isLoading;
  readonly error = this.sessionReportsService.error;

  readonly expandedReports = signal<Set<string>>(new Set());
  readonly selectedReport = signal<SessionReport | null>(null);

  readonly DateUtil = DateUtil;

  ngOnInit(): void {
    this.sessionReportsService.getReports().subscribe();
  }

  toggleReportDetails(reportId: string): void {
    const expanded = new Set(this.expandedReports());
    if (expanded.has(reportId)) {
      expanded.delete(reportId);
      this.selectedReport.set(null);
    } else {
      expanded.add(reportId);
      const report = this.reports().find(r => r.id === reportId);
      if (report) {
        this.sessionReportsService.getReportById(reportId).subscribe(() => {
          this.selectedReport.set(report);
        });
      }
    }
    this.expandedReports.set(expanded);
  }

  isReportExpanded(reportId: string): boolean {
    return this.expandedReports().has(reportId);
  }

  getReportDetails(reportId: string): SessionReport | null {
    if (this.isReportExpanded(reportId)) {
      return this.reports().find(r => r.id === reportId) || null;
    }
    return null;
  }
}

