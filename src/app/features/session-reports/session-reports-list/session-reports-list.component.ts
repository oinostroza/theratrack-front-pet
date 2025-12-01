import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionReportsService } from '../services/session-reports.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-session-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './session-reports-list.component.html',
  styleUrl: './session-reports-list.component.css'
})
export class SessionReportsListComponent implements OnInit {
  private readonly sessionReportsService = inject(SessionReportsService);

  readonly reports = this.sessionReportsService.reports;
  readonly isLoading = this.sessionReportsService.isLoading;
  readonly error = this.sessionReportsService.error;

  readonly DateUtil = DateUtil;

  ngOnInit(): void {
    this.sessionReportsService.getReports().subscribe();
  }
}

