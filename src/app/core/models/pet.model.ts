export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  ownerId: string;
  photoUrl?: string;
  // Relaciones (opcionales, vienen del backend cuando se incluyen)
  owner?: {
    id: string;
    email: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePetRequest {
  name: string;
  species: string;
  breed?: string;
  age?: number;
}

export interface UpdatePetRequest {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  photoUrl?: string;
}

