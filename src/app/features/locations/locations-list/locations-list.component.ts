import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocationsService } from '../services/locations.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { LocationUtil } from '../../../core/utils/location.util';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './locations-list.component.html',
  styleUrl: './locations-list.component.css'
})
export class LocationsListComponent implements OnInit {
  private readonly locationsService = inject(LocationsService);

  readonly locations = this.locationsService.locations;
  readonly isLoading = this.locationsService.isLoading;
  readonly error = this.locationsService.error;
  readonly LocationUtil = LocationUtil;

  ngOnInit(): void {
    this.locationsService.getLocations().subscribe();
  }
}

