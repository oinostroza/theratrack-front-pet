import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../users/services/users.service';
import { CareSessionsService } from '../../care-sessions/services/care-sessions.service';
import { PetsService } from '../../pets/services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { PetAvatarComponent } from '../../../shared/components/pet-avatar/pet-avatar.component';
import { LastSessionComponent } from '../../../shared/components/last-session/last-session.component';
import { DateUtil } from '../../../core/utils/date.util';
import { CurrencyUtil } from '../../../core/utils/currency.util';
import { StatusUtil } from '../../../core/utils/status.util';
import { Pet } from '../../../core/models/pet.model';
import { CareSession } from '../../../core/models/care-session.model';
import { UserWithPassword } from '../../../core/models/user.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-owners-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, PetAvatarComponent, LastSessionComponent],
  templateUrl: './owners-list.component.html',
  styleUrl: './owners-list.component.css'
})
export class OwnersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly petsService = inject(PetsService);

  readonly allUsers = this.usersService.users;
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly careSessions = this.careSessionsService.sessions;
  readonly pets = this.petsService.pets;

  // Filtrar solo owners
  readonly owners = computed(() => {
    return this.allUsers().filter(user => user.role === 'owner') as UserWithPassword[];
  });

  // Estado de expansión por owner
  readonly expandedOwners = signal<Set<string>>(new Set());
  readonly ownerPets = signal<Map<string, Pet[]>>(new Map());
  readonly ownerCareSessions = signal<Map<string, CareSession[]>>(new Map());
  
  // Estado de carga para botones
  readonly loadingButtons = signal<Set<string>>(new Set());
  
  // Paginación para mascotas y sesiones
  readonly petsPageSize = signal<number>(6);
  readonly sessionsPageSize = signal<number>(10);
  readonly petsCurrentPage = signal<Map<string, number>>(new Map());
  readonly sessionsCurrentPage = signal<Map<string, number>>(new Map());

  // Exponer utils para el template
  readonly DateUtil = DateUtil;
  readonly CurrencyUtil = CurrencyUtil;
  readonly StatusUtil = StatusUtil;

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      users: this.usersService.getUsers(),
      careSessions: this.careSessionsService.getSessions(),
      pets: this.petsService.getPets()
    }).subscribe({
      next: () => {
        // Pre-cargar datos de todos los owners
        const owners = this.owners();
        owners.forEach(owner => {
          this.getOwnerPets(owner.id);
          this.getOwnerCareSessions(owner.id);
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar datos');
        this.isLoading.set(false);
        console.error(error);
      }
    });
  }

  getOwnerPets(ownerId: string): Pet[] {
    if (!this.ownerPets().has(ownerId)) {
      const pets = this.pets().filter(pet => pet.ownerId.toString() === ownerId);
      const petsMap = new Map(this.ownerPets());
      petsMap.set(ownerId, pets);
      this.ownerPets.set(petsMap);
      return pets;
    }
    return this.ownerPets().get(ownerId) || [];
  }

  getOwnerCareSessions(ownerId: string): CareSession[] {
    if (!this.ownerCareSessions().has(ownerId)) {
      const ownerPets = this.getOwnerPets(ownerId);
      const petIds = ownerPets.map(pet => pet.id.toString());
      const sessions = this.careSessions().filter(session => 
        petIds.includes(session.petId.toString())
      );
      const sessionsMap = new Map(this.ownerCareSessions());
      sessionsMap.set(ownerId, sessions);
      this.ownerCareSessions.set(sessionsMap);
      return sessions;
    }
    return this.ownerCareSessions().get(ownerId) || [];
  }

  getTotalPaid(ownerId: string): number {
    const sessions = this.getOwnerCareSessions(ownerId);
    return sessions
      .filter(s => s.paid)
      .reduce((total, s) => total + 1, 0); // Por ahora solo contamos sesiones pagadas
  }

  getTotalPending(ownerId: string): number {
    const sessions = this.getOwnerCareSessions(ownerId);
    return sessions
      .filter(s => !s.paid)
      .reduce((total, s) => total + 1, 0); // Por ahora solo contamos sesiones pendientes
  }

  getSessionCount(ownerId: string): number {
    return this.getOwnerCareSessions(ownerId).length;
  }

  toggleOwnerDetails(ownerId: string): void {
    // Bloquear botón mientras carga
    const loading = new Set(this.loadingButtons());
    loading.add(ownerId);
    this.loadingButtons.set(loading);

    const expanded = new Set(this.expandedOwners());
    if (expanded.has(ownerId)) {
      expanded.delete(ownerId);
      loading.delete(ownerId);
      this.loadingButtons.set(loading);
    } else {
      expanded.add(ownerId);
      // Cargar datos si no están cargados
      this.getOwnerPets(ownerId);
      this.getOwnerCareSessions(ownerId);
      
      // Simular carga (en producción esto sería asíncrono)
      setTimeout(() => {
        loading.delete(ownerId);
        this.loadingButtons.set(loading);
      }, 500);
    }
    this.expandedOwners.set(expanded);
  }

  isButtonLoading(ownerId: string): boolean {
    return this.loadingButtons().has(ownerId);
  }

  isOwnerExpanded(ownerId: string): boolean {
    return this.expandedOwners().has(ownerId);
  }

  // Métodos de paginación para mascotas
  getOwnerPetsPaginated(ownerId: string): Pet[] {
    const allPets = this.getOwnerPets(ownerId);
    const currentPage = this.petsCurrentPage().get(ownerId) || 1;
    const pageSize = this.petsPageSize();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allPets.slice(startIndex, endIndex);
  }

  getTotalPetsPages(ownerId: string): number {
    const totalPets = this.getOwnerPets(ownerId).length;
    return Math.ceil(totalPets / this.petsPageSize());
  }

  getCurrentPetsPage(ownerId: string): number {
    return this.petsCurrentPage().get(ownerId) || 1;
  }

  setPetsPage(ownerId: string, page: number): void {
    const pages = new Map(this.petsCurrentPage());
    pages.set(ownerId, page);
    this.petsCurrentPage.set(pages);
  }

  // Métodos de paginación para sesiones
  getOwnerCareSessionsPaginated(ownerId: string): CareSession[] {
    const allSessions = this.getOwnerCareSessions(ownerId);
    const currentPage = this.sessionsCurrentPage().get(ownerId) || 1;
    const pageSize = this.sessionsPageSize();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allSessions.slice(startIndex, endIndex);
  }

  getTotalSessionsPages(ownerId: string): number {
    const totalSessions = this.getOwnerCareSessions(ownerId).length;
    return Math.ceil(totalSessions / this.sessionsPageSize());
  }

  getCurrentSessionsPage(ownerId: string): number {
    return this.sessionsCurrentPage().get(ownerId) || 1;
  }

  setSessionsPage(ownerId: string, page: number): void {
    const pages = new Map(this.sessionsCurrentPage());
    pages.set(ownerId, page);
    this.sessionsCurrentPage.set(pages);
  }
}

