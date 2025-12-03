import { Observable } from 'rxjs';
import { SessionReport, CreateSessionReportRequest, UpdateSessionReportRequest } from '../models/session-report.model';

/**
 * Interfaz para el servicio de reportes de sesiones
 * Implementa Dependency Inversion Principle (DIP)
 */
export interface ISessionReportsService {
  readonly reports: Readonly<{ (): SessionReport[] }>;
  readonly selectedReport: Readonly<{ (): SessionReport | null }>;
  readonly isLoading: Readonly<{ (): boolean }>;
  readonly error: Readonly<{ (): string | null }>;

  getReports(): Observable<SessionReport[]>;
  getReportsByPetId(petId: string): Observable<SessionReport[]>;
  getReportsBySessionId(careSessionId: string): Observable<SessionReport[]>;
  getReportById(id: string): Observable<SessionReport | null>;
  createReport(reportData: CreateSessionReportRequest): Observable<SessionReport | null>;
  updateReport(id: string, reportData: UpdateSessionReportRequest): Observable<SessionReport | null>;
  deleteReport(id: string): Observable<boolean>;
  selectReport(report: SessionReport | null): void;
  clearError(): void;
}

