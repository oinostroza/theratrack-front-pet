import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoggerService } from './logger.service';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

/**
 * Clase base abstracta para servicios que manejan entidades
 * Implementa el patrón común de signals y manejo de errores (SOLID - DRY)
 * 
 * @template T - Tipo de entidad que maneja el servicio
 */
@Injectable()
export abstract class BaseService<T> {
  protected readonly logger = this.getLogger();
  protected abstract getLogger(): LoggerService;

  // Signals para estado reactivo (común a todos los servicios)
  protected readonly _items = signal<T[]>([]);
  protected readonly _selectedItem = signal<T | null>(null);
  protected readonly _isLoading = signal<boolean>(false);
  protected readonly _error = signal<string | null>(null);

  // Readonly signals expuestos
  readonly items = this._items.asReadonly();
  readonly selectedItem = this._selectedItem.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Maneja errores de forma consistente (DRY)
   * @param error - Error capturado
   * @param context - Contexto del error para logging
   * @returns Observable que emite un array vacío o null
   */
  protected handleError<R>(error: any, context: string): Observable<R> {
    const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
    this._error.set(errorInfo.userFriendlyMessage);
    this.logger.error(`Error en ${context}`, errorInfo);
    return of(null as R);
  }

  /**
   * Maneja el estado de carga
   * @param isLoading - Estado de carga
   */
  protected setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Selecciona un item
   * @param item - Item a seleccionar
   */
  selectItem(item: T | null): void {
    this._selectedItem.set(item);
  }

  /**
   * Actualiza la lista de items después de una operación
   * @param updateFn - Función para actualizar la lista
   */
  protected updateItems(updateFn: (items: T[]) => T[]): void {
    this._items.update(updateFn);
  }

  /**
   * Agrega un item a la lista
   * @param item - Item a agregar
   */
  protected addItem(item: T): void {
    this._items.update(items => [...items, item]);
  }

  /**
   * Actualiza un item en la lista
   * @param id - ID del item a actualizar
   * @param item - Item actualizado
   * @param getIdFn - Función para obtener el ID de un item
   */
  protected updateItem(id: string | number, item: T, getIdFn: (item: T) => string | number): void {
    this._items.update(items => 
      items.map(i => getIdFn(i) === id ? item : i)
    );
    this._selectedItem.set(item);
  }

  /**
   * Elimina un item de la lista
   * @param id - ID del item a eliminar
   * @param getIdFn - Función para obtener el ID de un item
   */
  protected removeItem(id: string | number, getIdFn: (item: T) => string | number): void {
    this._items.update(items => items.filter(i => getIdFn(i) !== id));
    if (this._selectedItem() && getIdFn(this._selectedItem()!) === id) {
      this._selectedItem.set(null);
    }
  }
}

