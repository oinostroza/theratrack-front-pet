import { Observable } from 'rxjs';
import { CareSession, CreateCareSessionRequest, UpdateCareSessionRequest } from '../models/care-session.model';

/**
 * Interfaz para el servicio de sesiones de cuidado
 * Implementa Dependency Inversion Principle (DIP)
 */
export interface ICareSessionsService {
  readonly sessions: Readonly<{ (): CareSession[] }>;
  readonly selectedSession: Readonly<{ (): CareSession | null }>;
  readonly isLoading: Readonly<{ (): boolean }>;
  readonly error: Readonly<{ (): string | null }>;

  getSessions(): Observable<CareSession[]>;
  getSessionsByPetId(petId: string): Observable<CareSession[]>;
  getSessionById(id: string): Observable<CareSession | null>;
  createSession(sessionData: CreateCareSessionRequest): Observable<CareSession | null>;
  updateSession(id: string, sessionData: UpdateCareSessionRequest): Observable<CareSession | null>;
  markAsPaid(id: string): Observable<CareSession | null>;
  deleteSession(id: string): Observable<boolean>;
  selectSession(session: CareSession | null): void;
  clearError(): void;
}

