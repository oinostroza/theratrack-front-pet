import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorMessage {
  message: string;
  userFriendlyMessage: string;
}

export class ErrorHandlerUtil {
  static getErrorMessage(error: any): ErrorMessage {
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }

    if (error?.error?.message) {
      return {
        message: error.error.message,
        userFriendlyMessage: this.getUserFriendlyMessage(error.error.message),
      };
    }

    if (error?.message) {
      return {
        message: error.message,
        userFriendlyMessage: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
      };
    }

    return {
      message: 'Unknown error',
      userFriendlyMessage: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
    };
  }

  private static handleHttpError(error: HttpErrorResponse): ErrorMessage {
    switch (error.status) {
      case 0:
        return {
          message: 'Network error',
          userFriendlyMessage: 'No se puede conectar con el servidor. Verifica tu conexión a internet.',
        };
      case 400:
        return {
          message: error.error?.message || 'Bad request',
          userFriendlyMessage: error.error?.message || 'Los datos enviados no son válidos.',
        };
      case 401:
        return {
          message: 'Unauthorized',
          userFriendlyMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        };
      case 403:
        return {
          message: 'Forbidden',
          userFriendlyMessage: 'No tienes permisos para realizar esta acción.',
        };
      case 404:
        return {
          message: 'Not found',
          userFriendlyMessage: 'El recurso solicitado no fue encontrado.',
        };
      case 500:
        return {
          message: 'Internal server error',
          userFriendlyMessage: 'Error en el servidor. Por favor, intenta más tarde.',
        };
      default:
        return {
          message: `HTTP ${error.status}`,
          userFriendlyMessage: `Error del servidor (${error.status}). Por favor, intenta nuevamente.`,
        };
    }
  }

  private static getUserFriendlyMessage(message: string): string {
    const messageMap: Record<string, string> = {
      'already exists': 'Este registro ya existe en el sistema.',
      'not found': 'El recurso solicitado no fue encontrado.',
      'unauthorized': 'No tienes permisos para realizar esta acción.',
      'invalid credentials': 'Las credenciales proporcionadas no son válidas.',
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(messageMap)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    return message;
  }

  static isUnauthorizedError(error: any): boolean {
    return error instanceof HttpErrorResponse && error.status === 401;
  }

  static isNetworkError(error: any): boolean {
    return error instanceof HttpErrorResponse && error.status === 0;
  }
}

