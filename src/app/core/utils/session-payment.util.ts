import { Session } from '../models/session.model';

/**
 * Utilidad para cálculos relacionados con pagos de sesiones
 * Sigue el principio DRY (Don't Repeat Yourself)
 */
export class SessionPaymentUtil {
  /**
   * Calcula el total pagado de una lista de sesiones
   */
  static calculateTotalPaid(sessions: Session[]): number {
    return sessions
      .filter(s => s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }

  /**
   * Calcula el total pendiente de una lista de sesiones
   */
  static calculateTotalPending(sessions: Session[]): number {
    return sessions
      .filter(s => !s.pagado && s.precio != null)
      .reduce((total, s) => total + (Number(s.precio) || 0), 0);
  }

  /**
   * Calcula el total pagado para un paciente específico
   */
  static calculateTotalPaidForPatient(sessions: Session[], patientId: number): number {
    const patientSessions = sessions.filter(s => s.patientId === patientId);
    return this.calculateTotalPaid(patientSessions);
  }

  /**
   * Calcula el total pendiente para un paciente específico
   */
  static calculateTotalPendingForPatient(sessions: Session[], patientId: number): number {
    const patientSessions = sessions.filter(s => s.patientId === patientId);
    return this.calculateTotalPending(patientSessions);
  }

  /**
   * Obtiene el conteo de sesiones para un paciente
   */
  static getSessionCountForPatient(sessions: Session[], patientId: number): number {
    return sessions.filter(s => s.patientId === patientId).length;
  }
}

