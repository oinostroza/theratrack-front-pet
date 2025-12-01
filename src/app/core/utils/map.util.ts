/**
 * Utilidades para cálculos de mapas
 * DRY: Centraliza la lógica de posicionamiento en mapas
 */
export class MapUtil {
  /**
   * Calcula la posición X (horizontal) en un mapa basado en longitud
   * @param longitude - Longitud geográfica (-180 a 180)
   * @returns Porcentaje de posición X (0 a 100)
   */
  static getMapX(longitude: number): number {
    return ((Number(longitude) + 180) / 360) * 100;
  }

  /**
   * Calcula la posición Y (vertical) en un mapa basado en latitud
   * @param latitude - Latitud geográfica (-90 a 90)
   * @returns Porcentaje de posición Y (0 a 100)
   */
  static getMapY(latitude: number): number {
    return ((90 - Number(latitude)) / 180) * 100;
  }
}

