import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-pet-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-avatar.component.html',
  styleUrl: './pet-avatar.component.css'
})
export class PetAvatarComponent {
  @Input() pet?: Pet | { id: string; name: string; photoUrl?: string };
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  readonly sizeClasses = computed(() => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-xl'
    };
    return sizes[this.size];
  });

  readonly avatarUrl = computed(() => {
    return this.pet?.photoUrl;
  });

  readonly displayName = computed(() => {
    return this.pet?.name?.charAt(0)?.toUpperCase() || '?';
  });

  readonly emoji = computed(() => {
    // Emoji por defecto basado en especie si no hay foto
    if (!this.pet) return '🐾';
    const pet = this.pet as Pet;
    if (pet.species?.toLowerCase().includes('perro') || pet.species?.toLowerCase().includes('dog')) return '🐕';
    if (pet.species?.toLowerCase().includes('gato') || pet.species?.toLowerCase().includes('cat')) return '🐱';
    return '🐾';
  });
}

