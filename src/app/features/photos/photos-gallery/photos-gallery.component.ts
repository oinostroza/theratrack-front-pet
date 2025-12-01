import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PhotosService } from '../services/photos.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-photos-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, PhotoUploadComponent],
  templateUrl: './photos-gallery.component.html',
  styleUrl: './photos-gallery.component.css'
})
export class PhotosGalleryComponent implements OnInit {
  private readonly photosService = inject(PhotosService);

  @Input() petId?: string;
  @Input() careSessionId?: string;

  readonly photos = this.photosService.photos;
  readonly isLoading = this.photosService.isLoading;
  readonly error = this.photosService.error;

  ngOnInit(): void {
    if (this.petId) {
      this.photosService.getPhotosByPetId(this.petId).subscribe();
    } else if (this.careSessionId) {
      this.photosService.getPhotosBySessionId(this.careSessionId).subscribe();
    } else {
      this.photosService.getPhotos().subscribe();
    }
  }

  onPhotoUploaded(): void {
    // Recargar fotos después de subir
    if (this.petId) {
      this.photosService.getPhotosByPetId(this.petId).subscribe();
    } else if (this.careSessionId) {
      this.photosService.getPhotosBySessionId(this.careSessionId).subscribe();
    } else {
      this.photosService.getPhotos().subscribe();
    }
  }

  deletePhoto(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta foto?')) {
      this.photosService.deletePhoto(id).subscribe(() => {
        // Recargar después de eliminar
        this.ngOnInit();
      });
    }
  }
}

