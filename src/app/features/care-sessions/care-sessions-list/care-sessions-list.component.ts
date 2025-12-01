import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CareSessionsService } from '../services/care-sessions.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { DateUtil } from '../../../core/utils/date.util';
import { StatusUtil } from '../../../core/utils/status.util';

@Component({
  selector: 'app-care-sessions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './care-sessions-list.component.html',
  styleUrl: './care-sessions-list.component.css'
})
export class CareSessionsListComponent implements OnInit {
  private readonly careSessionsService = inject(CareSessionsService);

  readonly sessions = this.careSessionsService.sessions;
  readonly isLoading = this.careSessionsService.isLoading;
  readonly error = this.careSessionsService.error;

  readonly DateUtil = DateUtil;
  readonly StatusUtil = StatusUtil;

  ngOnInit(): void {
    this.careSessionsService.getSessions().subscribe();
  }
}

