export interface Patient {
  id: number;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  contactInfo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  fullName: string;
  email: string;
  age: number;
  gender: string;
  contactInfo?: string;
  notes?: string;
}

export interface UpdatePatientRequest {
  fullName?: string;
  email?: string;
  age?: number;
  gender?: string;
  contactInfo?: string;
  notes?: string;
}

