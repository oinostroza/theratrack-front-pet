/**
 * Utilidades para tipos de ubicación
 * DRY: Centraliza la lógica de tipos y etiquetas de ubicación
 */

export type LocationType = 'home' | 'vet' | 'grooming' | 'park' | 'other';

interface LocationTypeConfig {
  label: string;
  colorClasses: string;
  borderClasses: string;
  icon: string;
}

/**
 * Configuración de tipos de ubicación
 */
const LOCATION_TYPE_CONFIG: Record<LocationType, LocationTypeConfig> = {
  'home': {
    label: 'Casa',
    colorClasses: 'bg-blue-100 text-blue-800',
    borderClasses: 'border-blue-300',
    icon: '🏠'
  },
  'vet': {
    label: 'Veterinaria',
    colorClasses: 'bg-red-100 text-red-800',
    borderClasses: 'border-red-300',
    icon: '🏥'
  },
  'grooming': {
    label: 'Peluquería',
    colorClasses: 'bg-purple-100 text-purple-800',
    borderClasses: 'border-purple-300',
    icon: '✂️'
  },
  'park': {
    label: 'Parque',
    colorClasses: 'bg-green-100 text-green-800',
    borderClasses: 'border-green-300',
    icon: '🌳'
  },
  'other': {
    label: 'Otro',
    colorClasses: 'bg-gray-100 text-gray-800',
    borderClasses: 'border-gray-300',
    icon: '📍'
  }
};

/**
 * Utilidades para tipos de ubicación
 */
export class LocationUtil {
  /**
   * Obtiene las clases CSS para el color de un tipo de ubicación
   * @param type - Tipo de ubicación
   * @param includeBorder - Si incluir clases de borde (default: false)
   * @returns String con clases CSS de Tailwind
   */
  static getTypeColor(type: string, includeBorder: boolean = false): string {
    const config = LOCATION_TYPE_CONFIG[type as LocationType];
    if (!config) {
      return LOCATION_TYPE_CONFIG['other'].colorClasses + 
        (includeBorder ? ` ${LOCATION_TYPE_CONFIG['other'].borderClasses}` : '');
    }
    
    return config.colorClasses + (includeBorder ? ` ${config.borderClasses}` : '');
  }

  /**
   * Obtiene la etiqueta legible de un tipo de ubicación
   * @param type - Tipo de ubicación
   * @returns String con la etiqueta traducida
   */
  static getTypeLabel(type: string): string {
    const config = LOCATION_TYPE_CONFIG[type as LocationType];
    return config?.label || type;
  }

  /**
   * Obtiene el icono de un tipo de ubicación
   * @param type - Tipo de ubicación
   * @returns String con el emoji del icono
   */
  static getTypeIcon(type: string): string {
    const config = LOCATION_TYPE_CONFIG[type as LocationType];
    return config?.icon || LOCATION_TYPE_CONFIG['other'].icon;
  }

  /**
   * Obtiene la configuración completa de un tipo de ubicación
   * @param type - Tipo de ubicación
   * @returns Configuración del tipo o null si no existe
   */
  static getTypeConfig(type: string): LocationTypeConfig | null {
    return LOCATION_TYPE_CONFIG[type as LocationType] || null;
  }
}

