export interface CareSession {
  id: string;
  petId: string;
  sitterId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
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
  notes?: string;
}

