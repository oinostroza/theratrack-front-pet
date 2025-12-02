import { Component, Input, Output, EventEmitter, computed, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pet } from '../../../core/models/pet.model';
import { PhotoStorageService } from '../../../core/services/photo-storage.service';

@Component({
  selector: 'app-pet-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-avatar.component.html',
  styleUrl: './pet-avatar.component.css'
})
export class PetAvatarComponent {
  private readonly photoStorage = inject(PhotoStorageService);
  
  @Input() pet?: Pet | { id: string; name: string; photoUrl?: string };
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() clickable: boolean = false;
  @Output() avatarClick = new EventEmitter<Pet | { id: string; name: string; photoUrl?: string }>();

  private readonly _avatarUrl = signal<string | null>(null);

  readonly sizeClasses = computed(() => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-xl'
    };
    return sizes[this.size];
  });

  readonly avatarUrl = this._avatarUrl.asReadonly();

  constructor() {
    // Cargar la foto cuando cambie el pet
    effect(() => {
      const photoUrl = this.pet?.photoUrl;
      if (!photoUrl) {
        this._avatarUrl.set(null);
        return;
      }
      
      // Si ya es una URL absoluta o blob URL, usarla directamente
      if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('blob:')) {
        this._avatarUrl.set(photoUrl);
        return;
      }
      
      // Cargar desde IndexedDB
      const parts = photoUrl.split('/');
      if (parts.length === 3 && parts[0] === 'photos') {
        const folder = parts[1] as 'avatars' | 'sessions';
        const filename = parts[2];
        this.photoStorage.getPhotoUrl(filename, folder).then(blobUrl => {
          this._avatarUrl.set(blobUrl);
        }).catch(() => {
          this._avatarUrl.set(null);
        });
      } else {
        this._avatarUrl.set(null);
      }
    });
  }

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


