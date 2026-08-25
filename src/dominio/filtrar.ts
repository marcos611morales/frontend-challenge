/**
 * Búsqueda, filtros y paginación.
 *
 * Vive en dominio y no en el componente porque decide **qué movimientos ve el usuario**,
 * que es tan "un número que se ve" como el total. Además así el pipeline completo
 * —filtrar → buscar → paginar— se lee de corrido en un archivo, en vez de repartido entre
 * tres `useMemo`.
 */

import type { Categoria, Estado, Movimiento } from './tipos';

export const AMBITOS = ['incluidos', 'excluidos', 'todos'] as const;
export type Ambito = (typeof AMBITOS)[number];

export const TIPOS = ['todos', 'ingreso', 'gasto'] as const;
export type Tipo = (typeof TIPOS)[number];

/** `null` significa "sin filtrar por este campo", no "sin valor". */
export type Filtros = {
  busqueda: string;
  /**
   * `null` = sin filtrar. Un arreglo filtra a esas categorías, y un `null` DENTRO del
   * arreglo es "Sin categoría" — el mismo `null` que usa el dominio, sin cadena mágica
   * de por medio.
   *
   * Es un conjunto y no un valor suelto porque el donut agrupa la cola en "Otros", y
   * pulsar esa rebanada tiene que poder filtrar por las ocho categorías de golpe.
   */
  categorias: (Categoria | null)[] | null;
  tipo: Tipo;
  cuenta: string | 'sin-cuenta' | null;
  estado: Estado | null;
  ambito: Ambito;
};

export const FILTROS_INICIALES: Filtros = {
  busqueda: '',
  categorias: null,
  tipo: 'todos',
  cuenta: null,
  estado: null,
  ambito: 'incluidos',
};

export const hayFiltrosActivos = (f: Filtros): boolean =>
  f.busqueda.trim() !== '' ||
  f.categorias !== null ||
  f.tipo !== 'todos' ||
  f.cuenta !== null ||
  f.estado !== null ||
  f.ambito !== FILTROS_INICIALES.ambito;

/**
 * Sin acentos y en minúsculas: buscar "cafe brujula" tiene que encontrar
 * `txn_025` "CAFÉ BRÚJULA — ALCALÁ ☕". Nadie escribe los acentos en un buscador.
 */
const plegar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const coincide = (m: Movimiento, busqueda: string): boolean => {
  const aguja = plegar(busqueda.trim());
  if (aguja === '') return true;
  // La categoría entra a la búsqueda a propósito: "vivienda" es una forma natural de
  // buscar, y ahorra tener que abrir el filtro para una consulta de un solo término.
  return plegar(`${m.descripcion} ${m.categoria ?? 'sin categoria'}`).includes(aguja);
};

export const filtrar = (movimientos: Movimiento[], f: Filtros): Movimiento[] =>
  movimientos.filter((m) => {
    if (f.ambito === 'incluidos' && m.excluido) return false;
    if (f.ambito === 'excluidos' && !m.excluido) return false;

    if (f.tipo === 'ingreso' && m.monto <= 0) return false;
    if (f.tipo === 'gasto' && m.monto >= 0) return false;

    if (f.categorias !== null && !f.categorias.includes(m.categoria)) return false;

    if (f.cuenta !== null) {
      const objetivo = f.cuenta === 'sin-cuenta' ? null : f.cuenta;
      if (m.cuenta !== objetivo) return false;
    }

    if (f.estado !== null && m.estado !== f.estado) return false;

    return coincide(m, f.busqueda);
  });

export type Pagina<T> = {
  items: T[];
  /** Ya corregida: pedir la página 9 de 3 devuelve la 3, no una lista vacía. */
  pagina: number;
  paginas: number;
  total: number;
  /** 1-indexados y listos para "12–24 de 54". `0` en ambos si no hay resultados. */
  desde: number;
  hasta: number;
};

export const paginar = <T>(items: T[], pagina: number, tamano: number): Pagina<T> => {
  const seguro = Math.max(1, tamano);
  const paginas = Math.max(1, Math.ceil(items.length / seguro));
  const actual = Math.min(Math.max(1, pagina), paginas);
  const inicio = (actual - 1) * seguro;
  const visibles = items.slice(inicio, inicio + seguro);

  return {
    items: visibles,
    pagina: actual,
    paginas,
    total: items.length,
    desde: visibles.length === 0 ? 0 : inicio + 1,
    hasta: inicio + visibles.length,
  };
};

/** Dos conjuntos de categorías son el mismo filtro aunque vengan en distinto orden. */
export const mismasCategorias = (
  a: (Categoria | null)[] | null,
  b: (Categoria | null)[] | null,
): boolean => {
  if (a === null || b === null) return a === b;
  if (a.length !== b.length) return false;
  return a.every((c) => b.includes(c));
};

/** Las cuentas que existen en los datos. No se escriben a mano en ningún `<select>`. */
export const cuentasDe = (movimientos: Movimiento[]): string[] =>
  [...new Set(movimientos.flatMap((m) => (m.cuenta === null ? [] : [m.cuenta])))].sort();
