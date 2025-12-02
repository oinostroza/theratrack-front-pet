import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SessionReportsService } from '../services/session-reports.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SessionReportsDetailComponent } from '../session-reports-detail/session-reports-detail.component';
import { DateUtil } from '../../../core/utils/date.util';
import { SessionReport } from '../../../core/models/session-report.model';

@Component({
  selector: 'app-session-reports-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, ErrorDisplayComponent, ModalComponent, SessionReportsDetailComponent],
  templateUrl: './session-reports-list.component.html',
  styleUrl: './session-reports-list.component.css'
})
export class SessionReportsListComponent implements OnInit {
  private readonly sessionReportsService = inject(SessionReportsService);

  readonly reports = this.sessionReportsService.reports;
  readonly isLoading = this.sessionReportsService.isLoading;
  readonly error = this.sessionReportsService.error;

  readonly searchTerm = signal<string>('');
  readonly selectedReportId = signal<string | null>(null);
  readonly showDetailModal = signal<boolean>(false);

  readonly DateUtil = DateUtil;

  // Filtrar reportes basado en búsqueda
  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.reports();
    
    return this.reports().filter(report => {
      const dateStr = DateUtil.formatDateShort(report.reportDate).toLowerCase();
      const moodStr = report.mood?.toLowerCase() || '';
      const activitiesStr = report.activities.join(' ').toLowerCase();
      const notesStr = (report.notes || '').toLowerCase();
      const sessionIdStr = report.careSessionId.toLowerCase();
      
      return dateStr.includes(term) ||
             moodStr.includes(term) ||
             activitiesStr.includes(term) ||
             notesStr.includes(term) ||
             sessionIdStr.includes(term);
    });
  });

  ngOnInit(): void {
    this.sessionReportsService.getReports().subscribe();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  openDetailModal(reportId: string): void {
    this.selectedReportId.set(reportId);
    this.sessionReportsService.getReportById(reportId).subscribe(() => {
      this.showDetailModal.set(true);
    });
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedReportId.set(null);
  }

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

  getMoodColor(mood?: string): string {
    const colorMap: Record<string, string> = {
      'happy': 'bg-yellow-100 text-yellow-800',
      'calm': 'bg-blue-100 text-blue-800',
      'anxious': 'bg-orange-100 text-orange-800',
      'playful': 'bg-green-100 text-green-800',
      'tired': 'bg-gray-100 text-gray-800'
    };
    return colorMap[mood || ''] || 'bg-gray-100 text-gray-800';
  }
}
