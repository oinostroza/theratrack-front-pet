export class DateUtil {
  static formatDate(dateString: string, locale: string = 'es-CL'): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5); // HH:MM
  }

  static formatDateISO(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  static combineDateAndTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }
}

