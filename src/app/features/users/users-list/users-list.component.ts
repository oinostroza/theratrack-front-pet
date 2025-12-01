import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  readonly users = this.usersService.users;
  readonly isLoading = this.usersService.isLoading;
  readonly error = this.usersService.error;
  readonly currentUser = this.authService.user;

  // Estado para mostrar/ocultar contraseñas
  readonly showPasswords = new Map<string, boolean>();

  ngOnInit(): void {
    this.usersService.getUsers().subscribe();
  }

  togglePassword(userId: string): void {
    const current = this.showPasswords.get(userId) || false;
    this.showPasswords.set(userId, !current);
  }

  isPasswordVisible(userId: string): boolean {
    return this.showPasswords.get(userId) || false;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Opcional: mostrar notificación
      console.log('Copiado al portapapeles:', text);
    });
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800 border-red-300',
      'owner': 'bg-blue-100 text-blue-800 border-blue-300',
      'sitter': 'bg-green-100 text-green-800 border-green-300',
      'therapist': 'bg-purple-100 text-purple-800 border-purple-300',
      'patient': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[role] || colors['patient'];
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'owner': 'Dueño',
      'sitter': 'Cuidador',
      'therapist': 'Terapeuta',
      'patient': 'Paciente'
    };
    return labels[role] || role;
  }
}

