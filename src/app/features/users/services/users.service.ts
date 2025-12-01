import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerUtil } from '../../../core/utils/error-handler.util';
import { User, UserWithPassword } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  // Signals para estado reactivo
  private readonly _users = signal<UserWithPassword[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly signals
  readonly users = this._users.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Obtiene todos los usuarios (solo para admin)
   * Nota: Este endpoint debe devolver usuarios con sus contraseñas en texto plano
   * solo para propósitos de desarrollo/admin
   */
  getUsers(): Observable<UserWithPassword[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<UserWithPassword[]>(`${environment.apiUrl}${API_ENDPOINTS.USERS_WITH_PASSWORDS}`).pipe(
      tap((users) => {
        this._users.set(users);
        this.logger.info('Usuarios cargados', { count: users.length });
      }),
      catchError((error) => {
        const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
        this._error.set(errorInfo.userFriendlyMessage);
        this.logger.error('Error al cargar usuarios', errorInfo);
        return of([]);
      }),
      tap(() => this._isLoading.set(false))
    );
  }
}

