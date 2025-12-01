/**
 * Utilidades para estados y etiquetas
 * DRY: Centraliza la lógica de colores y etiquetas de estado
 */

export type CareSessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

interface StatusConfig {
  label: string;
  colorClasses: string;
  borderClasses?: string;
}

/**
 * Configuración de estados para sesiones de cuidado
 */
const CARE_SESSION_STATUS_CONFIG: Record<CareSessionStatus, StatusConfig> = {
  'scheduled': {
    label: 'Programada',
    colorClasses: 'bg-yellow-100 text-yellow-800',
    borderClasses: 'border-yellow-300'
  },
  'in-progress': {
    label: 'En Progreso',
    colorClasses: 'bg-blue-100 text-blue-800',
    borderClasses: 'border-blue-300'
  },
  'completed': {
    label: 'Completada',
    colorClasses: 'bg-green-100 text-green-800',
    borderClasses: 'border-green-300'
  },
  'cancelled': {
    label: 'Cancelada',
    colorClasses: 'bg-red-100 text-red-800',
    borderClasses: 'border-red-300'
  }
};

/**
 * Utilidades para estados de sesiones de cuidado
 */
export class StatusUtil {
  /**
   * Obtiene las clases CSS para el color de un estado
   * @param status - Estado de la sesión
   * @param includeBorder - Si incluir clases de borde (default: false)
   * @returns String con clases CSS de Tailwind
   */
  static getStatusColor(status: string, includeBorder: boolean = false): string {
    const config = CARE_SESSION_STATUS_CONFIG[status as CareSessionStatus];
    if (!config) {
      return 'bg-gray-100 text-gray-800' + (includeBorder ? ' border-gray-300' : '');
    }
    
    return config.colorClasses + (includeBorder && config.borderClasses ? ` ${config.borderClasses}` : '');
  }

  /**
   * Obtiene la etiqueta legible de un estado
   * @param status - Estado de la sesión
   * @returns String con la etiqueta traducida
   */
  static getStatusLabel(status: string): string {
    const config = CARE_SESSION_STATUS_CONFIG[status as CareSessionStatus];
    return config?.label || status;
  }

  /**
   * Obtiene la configuración completa de un estado
   * @param status - Estado de la sesión
   * @returns Configuración del estado o null si no existe
   */
  static getStatusConfig(status: string): StatusConfig | null {
    return CARE_SESSION_STATUS_CONFIG[status as CareSessionStatus] || null;
  }
}

