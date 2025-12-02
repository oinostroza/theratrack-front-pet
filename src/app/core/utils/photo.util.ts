import { environment } from '../../../environments/environment';

/**
 * Convierte una URL relativa de foto a una URL absoluta usando el apiUrl del backend
 * @param url URL relativa (ej: /uploads/photos/filename.jpg) o URL absoluta
 * @returns URL absoluta completa
 */
export function getPhotoUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  
  // Si ya es una URL absoluta (http:// o https://), retornarla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si es una ruta relativa, construir la URL completa con el apiUrl del backend
  const baseUrl = environment.apiUrl.replace(/\/$/, ''); // Remover trailing slash si existe
  const photoPath = url.startsWith('/') ? url : `/${url}`; // Asegurar que empiece con /
  
  return `${baseUrl}${photoPath}`;
}

