import { PhotoStorageService } from '../services/photo-storage.service';
import { signal, Signal, computed } from '@angular/core';

/**
 * Obtiene la URL de una foto desde el almacenamiento local
 * @param url Ruta de la foto (ej: photos/avatars/filename.jpg)
 * @param photoStorage Servicio de almacenamiento de fotos
 * @returns Promise con la URL blob de la foto o null
 */
export async function getPhotoUrl(
  url: string | undefined | null,
  photoStorage: PhotoStorageService
): Promise<string | null> {
  if (!url) return null;
  
  // Si ya es una URL absoluta (http:// o https://) o blob URL, retornarla tal cual
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  
  // Extraer carpeta y nombre de archivo de la ruta
  // Formato esperado: photos/avatars/filename.jpg o photos/sessions/filename.jpg
  const parts = url.split('/');
  if (parts.length !== 3 || parts[0] !== 'photos') {
    return null;
  }
  
  const folder = parts[1] as 'avatars' | 'sessions';
  const filename = parts[2];
  
  // Obtener la foto desde IndexedDB
  return await photoStorage.getPhotoUrl(filename, folder);
}

/**
 * Crea un signal reactivo para la URL de una foto
 * @param urlSignal Signal con la ruta de la foto
 * @param photoStorage Servicio de almacenamiento de fotos
 * @returns Signal con la URL blob de la foto
 */
export function createPhotoUrlSignal(
  urlSignal: Signal<string | undefined | null>,
  photoStorage: PhotoStorageService
): Signal<string | null> {
  const photoUrl = signal<string | null>(null);
  
  // Cargar la foto cuando cambie la URL
  computed(() => {
    const url = urlSignal();
    if (!url) {
      photoUrl.set(null);
      return;
    }
    
    // Si ya es una URL absoluta o blob URL, usarla directamente
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      photoUrl.set(url);
      return;
    }
    
    // Cargar desde IndexedDB
    const parts = url.split('/');
    if (parts.length === 3 && parts[0] === 'photos') {
      const folder = parts[1] as 'avatars' | 'sessions';
      const filename = parts[2];
      photoStorage.getPhotoUrl(filename, folder).then(blobUrl => {
        photoUrl.set(blobUrl);
      }).catch(() => {
        photoUrl.set(null);
      });
    } else {
      photoUrl.set(null);
    }
  });
  
  return photoUrl.asReadonly();
}

