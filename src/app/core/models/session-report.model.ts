export interface SessionReport {
  id: string;
  careSessionId: string;
  petId: string;
  sitterId: string;
  reportDate: string;
  activities: string[];
  notes: string;
  mood?: 'happy' | 'calm' | 'anxious' | 'playful' | 'tired';
  feeding?: {
    time: string;
    amount: string;
    foodType: string;
  };
  medication?: {
    time: string;
    medication: string;
    dosage: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSessionReportRequest {
  careSessionId: string;
  petId: string;
  sitterId: string;
  reportDate: string; // ISO 8601 date string
  activities: string[];
  notes: string;
  mood?: SessionReport['mood'];
  feeding?: SessionReport['feeding'];
  medication?: SessionReport['medication'];
}

export interface UpdateSessionReportRequest {
  activities?: string[];
  notes?: string;
  mood?: SessionReport['mood'];
  feeding?: SessionReport['feeding'];
  medication?: SessionReport['medication'];
}

