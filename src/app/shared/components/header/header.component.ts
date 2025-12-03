import { Component, computed, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() isSidebarOpen: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  
  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;

  /**
   * Obtiene el label del rol en español
   */
  getRoleLabel(role?: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Admin',
      'owner': 'Dueño',
      'sitter': 'Cuidador',
      'therapist': 'Terapeuta',
      'patient': 'Paciente'
    };
    return role ? roleMap[role] || role : 'Usuario';
  }

  logout(): void {
    this.authService.logout();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}

