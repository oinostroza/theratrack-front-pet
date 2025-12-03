import { Injectable, computed, Signal } from '@angular/core';

/**
 * Servicio para búsqueda y filtrado genérico
 * Implementa SOLID - Single Responsibility: solo se encarga de búsqueda
 * 
 * @template T - Tipo de entidad a buscar
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  /**
   * Filtra items basado en un término de búsqueda
   * @param items - Signal con los items a filtrar
   * @param searchTerm - Signal con el término de búsqueda
   * @param searchFields - Funciones que extraen los campos a buscar de cada item
   * @returns Signal computado con los items filtrados
   */
  filterItems<T>(
    items: Signal<T[]>,
    searchTerm: Signal<string>,
    searchFields: Array<(item: T) => string>
  ): Signal<T[]> {
    return computed(() => {
      const term = searchTerm().toLowerCase().trim();
      if (!term) return items();

      return items().filter(item => {
        return searchFields.some(field => {
          const value = field(item);
          return value?.toLowerCase().includes(term) ?? false;
        });
      });
    });
  }

  /**
   * Filtra items por múltiples criterios
   * @param items - Signal con los items a filtrar
   * @param filters - Objeto con funciones de filtrado
   * @returns Signal computado con los items filtrados
   */
  filterByCriteria<T>(
    items: Signal<T[]>,
    filters: Partial<Record<keyof T, (value: any) => boolean>>
  ): Signal<T[]> {
    return computed(() => {
      let filtered = items();

      for (const [key, filterFn] of Object.entries(filters)) {
        if (filterFn) {
          filtered = filtered.filter(item => {
            const value = (item as any)[key];
            return filterFn(value);
          });
        }
      }

      return filtered;
    });
  }
}

