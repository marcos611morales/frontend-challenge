/**
 * Todo número que aparece en pantalla se calcula aquí, una sola vez.
 *
 * Si el total se calculara también dentro de un componente, el día que cambie la regla de
 * qué entra al gasto sólo nos acordaríamos de uno de los dos lugares.
 */

import type { Categoria, Movimiento, MovimientoExcluido, MovimientoIncluido } from './tipos';

// ─── Qué es cada cosa ────────────────────────────────────────────────────────

export const esIncluido = (m: Movimiento): m is MovimientoIncluido => !m.excluido;
export const esExcluido = (m: Movimiento): m is MovimientoExcluido => m.excluido;

/** Salió dinero. El signo es la única fuente de verdad; `normalizar.ts` ya lo garantizó. */
export const esGasto = (m: MovimientoIncluido): boolean => m.monto < 0;

/** Entró dinero de fuera: nómina, un SPEI recibido. */
export const esIngreso = (m: MovimientoIncluido): boolean =>
  m.monto > 0 && m.categoria === 'Ingresos';

/**
 * Entró dinero que devuelve un gasto anterior. `txn_028` (+$1,899) es el reverso exacto
 * de `txn_007` AMAZON MX (−$1,899): contarlo como ingreso inflaría los ingresos 8.8% con
 * dinero que nunca fue de nadie. Se resta del gasto de su propia categoría, que es donde
 * el gasto se había contado de más.
 *
 * La regla es el signo más la categoría, no el id: cualquier reembolso futuro entra sola.
 */
export const esReembolso = (m: MovimientoIncluido): boolean =>
  m.monto > 0 && m.categoria !== 'Ingresos';

// ─── El resumen del mes ──────────────────────────────────────────────────────

export type Resumen = {
  ingresos: number;
  /** Positivo. Ya trae los reembolsos descontados. */
  gastoNeto: number;
  /** Ingresos − gasto neto. Negativo = se gastó más de lo que entró. */
  balance: number;
  movimientosIncluidos: number;
  movimientosTotales: number;
};

const sumar = (ns: number[]): number => ns.reduce((a, n) => a + n, 0);

export const resumir = (movimientos: Movimiento[]): Resumen => {
  const incluidos = movimientos.filter(esIncluido);

  const ingresos = sumar(incluidos.filter(esIngreso).map((m) => m.monto));
  const gastoBruto = Math.abs(sumar(incluidos.filter(esGasto).map((m) => m.monto)));
  const reembolsos = sumar(incluidos.filter(esReembolso).map((m) => m.monto));
  const gastoNeto = gastoBruto - reembolsos;

  return {
    ingresos,
    gastoNeto,
    balance: ingresos - gastoNeto,
    movimientosIncluidos: incluidos.length,
    movimientosTotales: movimientos.length,
  };
};

// ─── El reparto del gasto ────────────────────────────────────────────────────

/** `null` es "Sin categoría": no es un dato roto, es lo que el usuario puede corregir. */
export type Rebanada = {
  categoria: Categoria | null;
  monto: number;
  porcentaje: number;
};

export type Reparto = {
  rebanadas: Rebanada[];
  /**
   * Las categorías que no cupieron en el top, agrupadas. `null` si todas cupieron.
   *
   * Lleva la lista de categorías y no sólo cuántas son porque la rebanada "Otros" se
   * puede pulsar para filtrar la lista por todas ellas — con un número no se podría.
   */
  otros: { monto: number; porcentaje: number; categorias: (Categoria | null)[] } | null;
  total: number;
};

/**
 * Gasto por categoría, con los reembolsos ya restados de la suya.
 *
 * `txn_036` (COMISION, $0) no genera rebanada: la categoría existe pero una rebanada de
 * cero es ruido en un donut. Sigue visible en la lista, que es donde sí importa que exista.
 */
export const gastoPorCategoria = (movimientos: Movimiento[]): Map<Categoria | null, number> => {
  const porCategoria = new Map<Categoria | null, number>();
  const acumular = (categoria: Categoria | null, monto: number): void => {
    porCategoria.set(categoria, (porCategoria.get(categoria) ?? 0) + monto);
  };

  for (const m of movimientos.filter(esIncluido)) {
    if (esGasto(m)) acumular(m.categoria, Math.abs(m.monto));
    else if (esReembolso(m)) acumular(m.categoria, -m.monto);
  }

  for (const [categoria, monto] of porCategoria) {
    if (monto <= 0) porCategoria.delete(categoria);
  }

  return porCategoria;
};

/**
 * Top N + "Otros". Arriba de 6 rebanadas un donut deja de comunicar: se vuelve una
 * leyenda con un círculo al lado. Con Vivienda en 56.3% el contraste es justo lo que un
 * donut sí transmite de un vistazo, y el detalle fino se lee mejor en la lista.
 */
export const repartirGasto = (movimientos: Movimiento[], top = 5): Reparto => {
  const porCategoria = [...gastoPorCategoria(movimientos)].sort((a, b) => b[1] - a[1]);
  const total = sumar(porCategoria.map(([, monto]) => monto));
  const porcentaje = (monto: number): number => (total === 0 ? 0 : (monto / total) * 100);

  const cabeza = porCategoria.slice(0, top);
  const cola = porCategoria.slice(top);

  const montoOtros = sumar(cola.map(([, monto]) => monto));

  return {
    rebanadas: cabeza.map(([categoria, monto]) => ({ categoria, monto, porcentaje: porcentaje(monto) })),
    otros:
      cola.length > 0
        ? {
            monto: montoOtros,
            porcentaje: porcentaje(montoOtros),
            categorias: cola.map(([categoria]) => categoria),
          }
        : null,
    total,
  };
};
