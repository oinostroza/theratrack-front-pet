import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Location } from '../../../core/models/location.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css'
})
export class MapViewComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() location?: Location | null;
  @Input() height: string = '400px';
  @Input() zoom: number = 15;
  
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private readonly http = inject(HttpClient);
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private tileLayer: L.TileLayer | null = null;
  private isInitialized = false;
  private geocodedCoordinates: { lat: number; lng: number } | null = null;

  ngAfterViewInit(): void {
    // Esperar un poco para asegurar que el contenedor esté listo
    setTimeout(() => {
      if (this.location && this.mapContainer && !this.isInitialized) {
        this.initMap();
      }
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['location'] && this.location) {
      if (this.map && this.mapContainer) {
        // Si el mapa ya está inicializado, solo actualizar
        this.updateMap();
      } else if (this.mapContainer && !this.isInitialized) {
        // Si el contenedor está listo pero el mapa no, inicializar
        setTimeout(() => {
          if (!this.isInitialized) {
            this.initMap();
          }
        }, 200);
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
    if (this.tileLayer) {
      this.tileLayer.remove();
      this.tileLayer = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.isInitialized = false;
  }

  private initMap(): void {
    if (!this.location || !this.mapContainer || this.isInitialized) return;

    // Limpiar cualquier mapa existente
    this.cleanup();

    // Asegurar que el contenedor tenga dimensiones
    const container = this.mapContainer.nativeElement;
    if (!container.offsetHeight || !container.offsetWidth) {
      // Si no tiene dimensiones, esperar un poco más
      setTimeout(() => this.initMap(), 100);
      return;
    }

    // Geocodificar la dirección para obtener coordenadas
    this.geocodeAddress().then(coords => {
      if (!coords || !this.location) return;

      this.geocodedCoordinates = coords;

      // Crear mapa centrado en la ubicación geocodificada
      this.map = L.map(container, {
        center: [coords.lat, coords.lng],
        zoom: this.zoom,
        zoomControl: true,
        preferCanvas: false
      });

      // Agregar capa de OpenStreetMap
      this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3
      }).addTo(this.map);

      // Agregar marcador
      this.addMarker();

      this.isInitialized = true; 

      // Ajustar el tamaño del mapa después de inicializar
      setTimeout(() => {
        if (this.map && this.geocodedCoordinates) { 
          this.map.invalidateSize();
          // Forzar un redraw
          this.map.setView([this.geocodedCoordinates.lat, this.geocodedCoordinates.lng], this.zoom);
        }
      }, 400);
    }).catch(error => {
      console.error('Error geocodificando dirección:', error);
    });
  }

  private async geocodeAddress(): Promise<{ lat: number; lng: number } | null> {
    if (!this.location) return null;

    const address = this.getFullAddress();
    
    try {
      // Usar Nominatim API de OpenStreetMap (gratis, sin API key)
      const response = await firstValueFrom(
        this.http.get<any[]>(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        )
      );

      if (response && response.length > 0) {
        return {
          lat: parseFloat(response[0].lat),
          lng: parseFloat(response[0].lon)
        };
      }
    } catch (error) {
      console.error('Error en geocodificación:', error);
    }

    // Fallback: coordenadas de Santiago, Chile si falla la geocodificación
    return { lat: -33.4489, lng: -70.6693 };
  }

  private updateMap(): void {
    if (!this.location || !this.map) return;

    // Geocodificar la nueva dirección
    this.geocodeAddress().then(coords => {
      if (!coords || !this.map) return;

      this.geocodedCoordinates = coords;

      // Actualizar centro y zoom
      this.map.setView([coords.lat, coords.lng], this.zoom);

      // Actualizar marcador
      this.addMarker();
    });
  } 

  private addMarker(): void {
    if (!this.location || !this.map || !this.geocodedCoordinates) return;

    // Eliminar marcador anterior si existe
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Crear icono personalizado usando CDN de Leaflet
    const icon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Agregar marcador con popup usando coordenadas geocodificadas
    const address = this.getFullAddress();
    this.marker = L.marker([this.geocodedCoordinates.lat, this.geocodedCoordinates.lng], { icon })
      .addTo(this.map!)
      .bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <h3 style="font-weight: 600; color: #111827; margin-bottom: 4px; font-size: 14px;">${this.location.name}</h3>
          <p style="font-size: 12px; color: #4b5563;">${address}</p>
        </div>
      `);
  }

  private getFullAddress(): string {
    if (!this.location) return '';
    const address = this.location.address.trim();
    // Asegurar que siempre termine con ", Chile"
    if (address.toLowerCase().endsWith('chile')) {
      return address;
    }
    if (address.toLowerCase().endsWith(', chile')) {
      return address;
    }
    return `${address}, Chile`;
  }

  openInOpenStreetMap(): void {
    if (!this.location) return;
    // Usar la dirección completa en lugar de solo coordenadas
    const address = this.getFullAddress();
    const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }

  openDirections(): void {
    if (!this.location) return;
    // Usar Google Maps para direcciones con la dirección completa
    const address = this.getFullAddress();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }
}

