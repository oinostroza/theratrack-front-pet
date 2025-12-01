import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleFilterService } from '../../../core/services/role-filter.service';
import { NavItemComponent } from '../nav-item/nav-item.component';

interface NavItem {
  route: string;
  label: string;
  icon?: string;
  roles?: ('owner' | 'sitter' | 'admin' | 'therapist' | 'patient')[];
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NavItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly roleFilter = inject(RoleFilterService);
  
  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;

  // Items de navegación - Todas las rutas disponibles con iconos mejorados
  readonly navItems: NavItem[] = [
    { route: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['owner', 'sitter', 'admin'] },
    { route: '/users', label: 'Usuarios', icon: '👤', adminOnly: true },
    { route: '/patients', label: 'Dueños', icon: '👥', adminOnly: true },
    { route: '/calendar', label: 'Calendario', icon: '📅', roles: ['owner', 'sitter', 'admin'] },
    { route: '/pets', label: 'Mascotas', icon: '🐾', roles: ['owner', 'sitter', 'admin'] },
    { route: '/care-sessions', label: 'Sesiones de Cuidado', icon: '💼', roles: ['owner', 'sitter', 'admin'] },
    { route: '/session-reports', label: 'Reportes de Sesión', icon: '📋', roles: ['owner', 'sitter', 'admin'] },
    { route: '/locations', label: 'Ubicaciones', icon: '📍', roles: ['owner', 'sitter', 'admin'] },
    { route: '/photos', label: 'Fotos', icon: '📷', roles: ['owner', 'sitter', 'admin'] },
    { route: '/map', label: 'Mapa', icon: '🗺️', roles: ['owner', 'sitter', 'admin'] }
  ];

  // Filtrar items según el rol del usuario
  readonly visibleNavItems = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    
    // Usar el servicio de filtrado para verificar acceso a cada ruta
    return this.navItems.filter(item => {
      // Si es solo para admin, verificar con el servicio
      if (item.adminOnly) {
        return this.roleFilter.isAdmin();
      }
      
      // Verificar acceso usando el servicio de filtrado
      return this.roleFilter.canAccessRoute(item.route);
    });
  });

  logout(): void {
    this.authService.logout();
  }
}

