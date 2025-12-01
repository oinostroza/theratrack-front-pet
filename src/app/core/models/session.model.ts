export interface Session {
  id: number;
  patientId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  notasDelTerapeuta?: string;
  conceptoPrincipal?: string;
  precio: number;
  pagado: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSessionRequest {
  patientId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  notasDelTerapeuta?: string;
  conceptoPrincipal?: string;
  precio: number;
  pagado?: boolean;
}

export interface UpdateSessionRequest {
  patientId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  notasDelTerapeuta?: string;
  conceptoPrincipal?: string;
  precio?: number;
  pagado?: boolean;
}

