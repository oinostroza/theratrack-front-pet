import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotosService } from '../../../features/photos/services/photos.service';
import { LoadingComponent } from '../loading/loading.component';
import { ErrorDisplayComponent } from '../error-display/error-display.component';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './photo-upload.component.html',
  styleUrl: './photo-upload.component.css'
})
export class PhotoUploadComponent {
  private readonly photosService = inject(PhotosService);

  @Input() petId?: string;
  @Input() careSessionId?: string;
  @Input() sessionReportId?: string;
  @Input() accept: string = 'image/*';
  @Output() photoUploaded = new EventEmitter<string>();
  @Output() photoSelected = new EventEmitter<File>();

  readonly isLoading = this.photosService.isLoading;
  readonly error = this.photosService.error;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.photoSelected.emit(this.selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile) return;

    const photoData = {
      file: this.selectedFile,
      petId: this.petId,
      careSessionId: this.careSessionId,
      sessionReportId: this.sessionReportId
    };

    this.photosService.uploadPhoto(photoData).subscribe((photo) => {
      if (photo) {
        this.photoUploaded.emit(photo.id);
        this.reset();
      }
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }
}

