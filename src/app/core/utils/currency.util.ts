/**
 * Utilidades para formateo de moneda
 * DRY: Centraliza el formateo de moneda en un solo lugar
 */
export class CurrencyUtil {
  private static readonly DEFAULT_LOCALE = 'es-CL';
  private static readonly DEFAULT_CURRENCY = 'CLP';

  /**
   * Formatea un monto como moneda chilena
   * @param amount - Monto a formatear
   * @param locale - Locale para formateo (default: 'es-CL')
   * @param currency - Código de moneda (default: 'CLP')
   * @returns String formateado como moneda
   */
  static format(
    amount: number,
    locale: string = this.DEFAULT_LOCALE,
    currency: string = this.DEFAULT_CURRENCY
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Formatea un monto como moneda chilena (método abreviado)
   */
  static formatCLP(amount: number): string {
    return this.format(amount);
  }
}

