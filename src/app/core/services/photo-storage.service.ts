import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';

/**
 * Servicio para almacenar fotos localmente usando IndexedDB
 */
@Injectable({
  providedIn: 'root'
})
export class PhotoStorageService {
  private readonly logger = inject(LoggerService);
  private dbName = 'PhotoStorageDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  /**
   * Inicializa la base de datos IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        this.logger.error('Error al abrir IndexedDB', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Crear object store para avatares
        if (!db.objectStoreNames.contains('avatars')) {
          db.createObjectStore('avatars', { keyPath: 'filename' });
        }
        
        // Crear object store para sesiones
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'filename' });
        }
      };
    });
  }

  /**
   * Guarda un archivo en IndexedDB
   * @param file Archivo a guardar
   * @param folder Carpeta donde guardar ('avatars' o 'sessions')
   * @returns Nombre del archivo generado
   */
  async savePhoto(file: File, folder: 'avatars' | 'sessions'): Promise<string> {
    await this.initDB();

    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${random}.${ext}`;

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([folder], 'readwrite');
      const store = transaction.objectStore(folder);

      // Leer el archivo como ArrayBuffer
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        const photoData = {
          filename: filename,
          data: arrayBuffer,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };

        const request = store.add(photoData);

        request.onsuccess = () => {
          this.logger.info(`Foto guardada: ${filename} en carpeta ${folder}`);
          resolve(filename);
        };

        request.onerror = () => {
          this.logger.error('Error al guardar foto en IndexedDB', request.error);
          reject(request.error);
        };
      };

      reader.onerror = () => {
        this.logger.error('Error al leer archivo', reader.error);
        reject(reader.error);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Obtiene una foto desde IndexedDB
   * @param filename Nombre del archivo
   * @param folder Carpeta donde buscar ('avatars' o 'sessions')
   * @returns Blob URL de la foto
   */
  async getPhotoUrl(filename: string, folder: 'avatars' | 'sessions'): Promise<string | null> {
    await this.initDB();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([folder], 'readonly');
      const store = transaction.objectStore(folder);
      const request = store.get(filename);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Convertir ArrayBuffer a Blob
        const blob = new Blob([result.data], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      request.onerror = () => {
        this.logger.error('Error al obtener foto de IndexedDB', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Elimina una foto de IndexedDB
   * @param filename Nombre del archivo
   * @param folder Carpeta donde buscar ('avatars' o 'sessions')
   */
  async deletePhoto(filename: string, folder: 'avatars' | 'sessions'): Promise<void> {
    await this.initDB();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([folder], 'readwrite');
      const store = transaction.objectStore(folder);
      const request = store.delete(filename);

      request.onsuccess = () => {
        this.logger.info(`Foto eliminada: ${filename} de carpeta ${folder}`);
        resolve();
      };

      request.onerror = () => {
        this.logger.error('Error al eliminar foto de IndexedDB', request.error);
        reject(request.error);
      };
    });
  }
}

