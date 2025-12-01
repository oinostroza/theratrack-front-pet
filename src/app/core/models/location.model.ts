export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  petId?: string;
  ownerId: string;
  type: 'home' | 'vet' | 'grooming' | 'park' | 'other';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  petId?: string;
  type: Location['type'];
  notes?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type?: Location['type'];
  notes?: string;
}

