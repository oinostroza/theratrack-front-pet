import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../../../core/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly roleFilter = inject(RoleFilterService);

  // Signals para estado reactivo
  private readonly _patients = signal<Patient[]>([]);
  private readonly _selectedPatient = signal<Patient | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly patients = this._patients.asReadonly();
  readonly selectedPatient = this._selectedPatient.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todos los pacientes (dueños)
   */
  getPatients(): Observable<Patient[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Patient[]>(`${environment.apiUrl}${API_ENDPOINTS.PATIENTS}`).pipe(
      map((patients) => this.roleFilter.filterPatients(patients)),
      tap((patients) => {
        this._patients.set(patients);
        this.logger.info('Pacientes cargados', { count: patients.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar pacientes', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Obtiene un paciente por ID
   */
  getPatientById(id: number): Observable<Patient | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Patient>(`${environment.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}`).pipe(
      tap((patient) => {
        this._selectedPatient.set(patient);
        this.logger.info('Paciente cargado', { id: patient.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar paciente', errorInfo);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Crea un nuevo paciente
   */
  createPatient(patient: CreatePatientRequest): Observable<Patient> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<Patient>(`${environment.apiUrl}${API_ENDPOINTS.PATIENTS}`, patient).pipe(
      tap((newPatient) => {
        this._patients.update(patients => [...patients, newPatient]);
        this.logger.info('Paciente creado', { id: newPatient.id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al crear paciente', errorInfo);
        throw error;
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Actualiza un paciente
   */
  updatePatient(id: number, patient: UpdatePatientRequest): Observable<Patient> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.patch<Patient>(`${environment.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}`, patient).pipe(
      tap((updatedPatient) => {
        this._patients.update(patients => 
          patients.map(p => p.id === id ? updatedPatient : p)
        );
        if (this._selectedPatient()?.id === id) {
          this._selectedPatient.set(updatedPatient);
        }
        this.logger.info('Paciente actualizado', { id });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al actualizar paciente', errorInfo);
        throw error;
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Elimina un paciente
   */
  deletePatient(id: number): Observable<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}`).pipe(
      tap(() => {
        this._patients.update(patients => patients.filter(p => p.id !== id));
        if (this._selectedPatient()?.id === id) {
          this._selectedPatient.set(null);
        }
        this.logger.info('Paciente eliminado', { id });
        this._isLoading.set(false);
      }),
      map(() => true),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al eliminar paciente', errorInfo);
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  /**
   * Selecciona un paciente
   */
  selectPatient(patient: Patient | null): void {
    this._selectedPatient.set(patient);
  }
}

