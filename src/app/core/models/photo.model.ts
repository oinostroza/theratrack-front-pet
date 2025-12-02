export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  petId?: string;
  careSessionId?: string;
  sessionReportId?: string;
  uploadedBy: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePhotoRequest {
  file: File;
  petId?: string;
  careSessionId?: string;
  sessionReportId?: string;
  description?: string;
  tags?: string[];
  folder?: 'avatars' | 'sessions'; // Carpeta donde se guardará la foto
}

export interface UpdatePhotoRequest {
  description?: string;
  tags?: string[];
}

