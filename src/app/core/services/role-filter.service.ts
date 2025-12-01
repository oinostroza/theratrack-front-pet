import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Pet } from '../models/pet.model';
import { CareSession } from '../models/care-session.model';
import { SessionReport } from '../models/session-report.model';
import { Location } from '../models/location.model';
import { Photo } from '../models/photo.model';
import { Patient } from '../models/patient.model';
import { Session } from '../models/session.model';

/**
 * Servicio para filtrar datos según el rol del usuario
 * Implementa el principio de responsabilidad única (SOLID)
 */
@Injectable({
  providedIn: 'root'
})
export class RoleFilterService {
  private readonly authService = inject(AuthService);

  /**
   * Filtra mascotas según el rol del usuario
   */
  filterPets(pets: Pet[]): Pet[] {
    const user = this.authService.user();
    if (!user) return [];

    // Admin ve todo
    if (user.role === 'admin') {
      return pets;
    }

    // Owner ve solo sus mascotas
    if (user.role === 'owner') {
      return pets.filter(pet => pet.ownerId.toString() === user.id.toString());
    }

    // Sitter no ve mascotas directamente, solo a través de sesiones
    if (user.role === 'sitter') {
      return [];
    }

    // Otros roles no ven mascotas
    return [];
  }

  /**
   * Filtra sesiones de cuidado según el rol del usuario
   * @param sessions - Sesiones de cuidado a filtrar
   * @param ownerPetIds - IDs de mascotas del owner (opcional, solo para owners)
   */
  filterCareSessions(sessions: CareSession[], ownerPetIds?: string[]): CareSession[] {
    const user = this.authService.user();
    if (!user) return [];

    // Admin ve todo
    if (user.role === 'admin') {
      return sessions;
    }

    // Owner ve sesiones de sus mascotas
    if (user.role === 'owner') {
      if (ownerPetIds && ownerPetIds.length > 0) {
        return sessions.filter(session => ownerPetIds.includes(session.petId.toString()));
      }
      // Si no tenemos los IDs de mascotas, retornamos vacío por seguridad
      return [];
    }

    // Sitter ve solo sus sesiones asignadas
    if (user.role === 'sitter') {
      return sessions.filter(session => session.sitterId.toString() === user.id.toString());
    }

    return [];
  }

  /**
   * Filtra reportes de sesión según el rol del usuario
   * @param reports - Reportes a filtrar
   * @param ownerPetIds - IDs de mascotas del owner (opcional, solo para owners)
   * @param sitterSessionIds - IDs de sesiones del sitter (opcional, solo para sitters)
   */
  filterSessionReports(reports: SessionReport[], ownerPetIds?: string[], sitterSessionIds?: string[]): SessionReport[] {
    const user = this.authService.user();
    if (!user) return [];

    // Admin ve todo
    if (user.role === 'admin') {
      return reports;
    }

    // Owner ve reportes de sesiones de sus mascotas
    if (user.role === 'owner' && ownerPetIds && ownerPetIds.length > 0) {
      // Filtrar reportes donde el petId corresponde a una de sus mascotas
      return reports.filter(report => 
        report.petId && ownerPetIds.includes(report.petId.toString())
      );
    }

    // Sitter ve reportes de sus sesiones
    if (user.role === 'sitter' && sitterSessionIds && sitterSessionIds.length > 0) {
      return reports.filter(report => 
        report.careSessionId && sitterSessionIds.includes(report.careSessionId.toString())
      );
    }

    // Si no tenemos los datos necesarios, retornamos vacío por seguridad
    if (user.role === 'owner' || user.role === 'sitter') {
      return [];
    }

    return [];
  }

  /**
   * Filtra ubicaciones según el rol del usuario
   */
  filterLocations(locations: Location[]): Location[] {
    const user = this.authService.user();
    if (!user) return [];

    // Admin ve todo
    if (user.role === 'admin') {
      return locations;
    }

    // Owner ve solo sus ubicaciones
    if (user.role === 'owner') {
      return locations.filter(location => location.ownerId?.toString() === user.id.toString());
    }

    // Sitter no ve ubicaciones directamente
    return [];
  }

  /**
   * Filtra fotos según el rol del usuario
   * @param photos - Fotos a filtrar
   * @param ownerPetIds - IDs de mascotas del owner (opcional, solo para owners)
   * @param sitterSessionIds - IDs de sesiones del sitter (opcional, solo para sitters)
   */
  filterPhotos(photos: Photo[], ownerPetIds?: string[], sitterSessionIds?: string[]): Photo[] {
    const user = this.authService.user();
    if (!user) return [];

    // Admin ve todo
    if (user.role === 'admin') {
      return photos;
    }

    // Owner ve fotos de sus mascotas
    if (user.role === 'owner' && ownerPetIds && ownerPetIds.length > 0) {
      return photos.filter(photo => 
        (photo.petId && ownerPetIds.includes(photo.petId.toString())) ||
        (photo.careSessionId && ownerPetIds.includes(photo.careSessionId.toString())) // Si la foto está asociada a una sesión de su mascota
      );
    }

    // Sitter ve fotos de sesiones asignadas
    if (user.role === 'sitter' && sitterSessionIds && sitterSessionIds.length > 0) {
      return photos.filter(photo => 
        photo.careSessionId && sitterSessionIds.includes(photo.careSessionId.toString())
      );
    }

    // Si no tenemos los datos necesarios, retornamos vacío por seguridad
    if (user.role === 'owner' || user.role === 'sitter') {
      return [];
    }

    return [];
  }

  /**
   * Filtra pacientes según el rol del usuario
   */
  filterPatients(patients: Patient[]): Patient[] {
    const user = this.authService.user();
    if (!user) return [];

    // Solo admin y therapist ven pacientes
    if (user.role === 'admin' || user.role === 'therapist') {
      return patients;
    }

    // Patient ve solo su propio registro
    if (user.role === 'patient') {
      // Asumiendo que el patient.id coincide con el user.id
      return patients.filter(patient => patient.id.toString() === user.id.toString());
    }

    return [];
  }

  /**
   * Filtra sesiones de terapia según el rol del usuario
   */
  filterSessions(sessions: Session[]): Session[] {
    const user = this.authService.user();
    if (!user) return [];

    // Admin y therapist ven todas las sesiones
    if (user.role === 'admin' || user.role === 'therapist') {
      return sessions;
    }

    // Patient ve solo sus sesiones
    if (user.role === 'patient') {
      return sessions.filter(session => session.patientId?.toString() === user.id.toString());
    }

    return [];
  }

  /**
   * Verifica si el usuario puede ver una ruta específica
   */
  canAccessRoute(route: string): boolean {
    const user = this.authService.user();
    if (!user) return false;

    // Admin puede acceder a todo
    if (user.role === 'admin') {
      return true;
    }

    // Rutas específicas por rol
    const routePermissions: Record<string, string[]> = {
      '/dashboard': ['owner', 'sitter', 'admin', 'therapist', 'patient'],
      '/users': ['admin'],
      '/patients': ['admin', 'therapist'],
      '/calendar': ['owner', 'sitter', 'admin', 'therapist'],
      '/pets': ['owner', 'admin'],
      '/care-sessions': ['owner', 'sitter', 'admin'],
      '/session-reports': ['owner', 'sitter', 'admin'],
      '/locations': ['owner', 'admin'],
      '/photos': ['owner', 'sitter', 'admin'],
      '/map': ['owner', 'sitter', 'admin']
    };

    const allowedRoles = routePermissions[route];
    if (!allowedRoles) {
      // Si la ruta no está en la lista, solo admin puede acceder
      return false;
    }

    return allowedRoles.includes(user.role);
  }

  /**
   * Verifica si el usuario es admin
   */
  isAdmin(): boolean {
    const user = this.authService.user();
    return user?.role === 'admin';
  }

  /**
   * Obtiene el usuario actual (para uso interno en servicios)
   */
  getCurrentUser() {
    return this.authService.user();
  }
}

