export interface CareSession {
  id: string;
  petId: string;
  sitterId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  paid: boolean;
  notes?: string;
  // Relaciones (opcionales, vienen del backend cuando se incluyen)
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    photoUrl?: string;
    ownerId: string;
  };
  owner?: {
    id: string;
    email: string;
    name?: string;
  };
  sitter?: {
    id: string;
    email: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCareSessionRequest {
  petId: string;
  sitterId: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}

export interface UpdateCareSessionRequest {
  startTime?: string;
  endTime?: string;
  status?: CareSession['status'];
  paid?: boolean;
  notes?: string;
}

