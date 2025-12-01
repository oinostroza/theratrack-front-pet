import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationsService } from '../services/locations.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { LocationUtil } from '../../../core/utils/location.util';

@Component({
  selector: 'app-locations-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './locations-detail.component.html',
  styleUrl: './locations-detail.component.css'
})
export class LocationsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly locationsService = inject(LocationsService);

  readonly selectedLocation = this.locationsService.selectedLocation;
  readonly isLoading = this.locationsService.isLoading;
  readonly error = this.locationsService.error;
  readonly LocationUtil = LocationUtil;

  ngOnInit(): void {
    const locationId = this.route.snapshot.paramMap.get('id');
    if (locationId) {
      this.locationsService.getLocationById(locationId).subscribe();
    }
  }

  deleteLocation(): void {
    const location = this.selectedLocation();
    if (location && confirm(`¿Estás seguro de eliminar esta ubicación?`)) {
      this.locationsService.deleteLocation(location.id).subscribe((success) => {
        if (success) {
          this.router.navigate(['/locations']);
        }
      });
    }
  }
}

