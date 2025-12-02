import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private tileLayer: L.TileLayer | null = null;
  private isInitialized = false;

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

    // Crear mapa centrado en la ubicación
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.location.latitude, this.location.longitude],
      zoom: this.zoom,
      zoomControl: true
    });

    // Agregar capa de OpenStreetMap
    this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Agregar marcador
    this.addMarker();

    this.isInitialized = true;

    // Ajustar el tamaño del mapa después de inicializar
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);
  }

  private updateMap(): void {
    if (!this.location || !this.map) return;

    // Actualizar centro y zoom
    this.map.setView([this.location.latitude, this.location.longitude], this.zoom);

    // Actualizar marcador
    this.addMarker();
  }

  private addMarker(): void {
    if (!this.location || !this.map) return;

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

    // Agregar marcador con popup
    const address = this.location.address.includes('Chile') 
      ? this.location.address 
      : `${this.location.address}, Chile`;
    this.marker = L.marker([this.location.latitude, this.location.longitude], { icon })
      .addTo(this.map!)
      .bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <h3 style="font-weight: 600; color: #111827; margin-bottom: 4px; font-size: 14px;">${this.location.name}</h3>
          <p style="font-size: 12px; color: #4b5563;">${address}</p>
        </div>
      `);
  }

  openInOpenStreetMap(): void {
    if (!this.location) return;
    const lat = this.location.latitude;
    const lng = this.location.longitude;
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=${this.zoom}`;
    window.open(url, '_blank');
  }

  openDirections(): void {
    if (!this.location) return;
    // Usar Google Maps para direcciones (gratis para uso básico)
    const address = encodeURIComponent(`${this.location.address}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(url, '_blank');
  }
}

