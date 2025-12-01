import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Mapa</h1>
      <p class="text-gray-600">Próximamente...</p>
    </div>
  `
})
export class MapComponent {
}

