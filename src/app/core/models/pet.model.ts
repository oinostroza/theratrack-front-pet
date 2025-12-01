export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  ownerId: string;
  photoUrl?: string;
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
}

