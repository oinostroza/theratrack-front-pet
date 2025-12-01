import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import { StorageService } from './storage.service';
import { LoggerService } from './logger.service';
import { ErrorHandlerUtil } from '../utils/error-handler.util';
import { User, LoginRequest, LoginResponse, AuthState } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);

  // Signals para estado reactivo
  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  // Computed signals
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isLoading = this._isLoading.asReadonly();
  readonly authState = computed<AuthState>(() => ({
    user: this._user(),
    isAuthenticated: !!this._user(),
    isLoading: this._isLoading()
  }));

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación desde el storage
   */
  private initializeAuth(): void {
    if (this.storageService.hasToken()) {
      // Restaurar usuario desde localStorage
      const savedUser = this.storageService.getUser();
      if (savedUser) {
        this._user.set(savedUser);
        this.logger.debug('Usuario restaurado desde storage', { 
          email: savedUser.email, 
          role: savedUser.role,
          user: savedUser 
        });
        // Debug: Log del usuario restaurado
        console.log('Usuario restaurado:', savedUser);
        console.log('Rol restaurado:', savedUser.role);
      } else {
        // Si hay token pero no hay usuario guardado, intentar decodificar el token
        // o hacer una petición al backend para obtener el usuario
        this.logger.debug('Token encontrado pero no hay usuario guardado');
        // Por ahora, si no hay usuario guardado, limpiamos el token
        // En el futuro se puede hacer una petición al backend para validar y obtener el usuario
        this.storageService.removeToken();
      }
    }
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse | null> {
    this._isLoading.set(true);
    
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      credentials
    ).pipe(
      tap((response) => {
        this.handleLoginSuccess(response);
        this.logger.info('Login exitoso', { email: credentials.email });
      }),
      catchError((error) => {
        this.handleLoginError(error);
        return of(null);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Maneja el éxito del login
   */
  private handleLoginSuccess(response: LoginResponse): void {
    this.storageService.setToken(response.access_token);
    // Asegurar que el usuario tenga name (usar email si no existe)
    const user = {
      ...response.user,
      name: response.user.name || response.user.email.split('@')[0],
      id: response.user.id.toString()
    };
    this._user.set(user);
    // Guardar usuario en localStorage para persistencia
    this.storageService.setUser(user);
  }

  /**
   * Maneja errores del login
   */
  private handleLoginError(error: any): void {
    const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
    this.logger.error('Error en login', errorInfo);
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.storageService.removeToken();
    this.storageService.removeUser();
    this._user.set(null);
    this.logger.info('Usuario deslogueado');
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  checkAuth(): boolean {
    return this.storageService.hasToken() && !!this._user();
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.storageService.getToken();
  }
}

