/**
 * Un solo lugar donde se decide cómo se ve un número o una fecha.
 *
 * Concatenar `"$" + monto` en un componente parece inofensivo hasta que hay que mostrar
 * los 12 USD de `txn_032` y resulta que la mitad de la app asume pesos.
 */

import type { Moneda } from './tipos';

/**
 * El archivo trae las fechas con offset `-06:00`: son horas del banco, no del navegador.
 * Fijar la zona hace que la app muestre lo mismo abierta desde cualquier lado —si no,
 * `txn_060` (2 sep 00:00) se leería como 1 de septiembre en media Europa.
 */
const ZONA = 'America/Mexico_City';

const monedas: Record<Moneda, Intl.NumberFormat> = {
  MXN: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }),
  USD: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }),
};

/**
 * `Intl` emite un guion (U+002D) y el resumen usa el signo menos tipográfico (U+2212).
 * Mezclarlos deja dos glifos distintos para lo mismo en la misma pantalla, y el guion es
 * más corto y más alto — se nota en una columna de cifras alineadas.
 */
const MENOS = '\u2212';

/** Con signo. Para montos sueltos donde importa si entró o salió dinero. */
export const formatearMonto = (monto: number, moneda: Moneda = 'MXN'): string =>
  monedas[moneda].format(monto).replace(/^-/, MENOS);

/**
 * Sin signo. Para totales que ya vienen etiquetados ("Gasto neto"), donde un menos
 * delante sólo confunde: nadie necesita que le digan que un gasto es negativo.
 */
export const formatearTotal = (monto: number, moneda: Moneda = 'MXN'): string =>
  monedas[moneda].format(Math.abs(monto));

const diaMes = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', timeZone: ZONA });
const diaMesAno = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: ZONA });
const hora = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: ZONA });

/** "13 ago" — dentro del periodo el año es ruido, todos los movimientos lo comparten. */
export const formatearDia = (fecha: Date): string => diaMes.format(fecha);

/** "14 nov 2025" — con año, para lo que quedó fuera del periodo, que es justo el punto. */
export const formatearFechaLarga = (fecha: Date): string => diaMesAno.format(fecha);

export const formatearHora = (fecha: Date): string => hora.format(fecha);

const porcentajes = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Recibe 56.3, no 0.563 — que es como sale de `repartirGasto`. */
export const formatearPorcentaje = (porcentaje: number): string => porcentajes.format(porcentaje / 100);

const mesAno = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** "2026-08" → "agosto de 2026". El periodo lo declara el archivo, no el reloj. */
export const formatearPeriodo = (periodo: string): string => {
  const fecha = new Date(`${periodo}-01T00:00:00Z`);
  return Number.isNaN(fecha.getTime()) ? periodo : mesAno.format(fecha);
};
