/**
 * Corregir la categoría de un movimiento mal clasificado — el segundo objetivo del reto.
 *
 * Se guarda sólo el diff (`{ txn_005: 'Transporte' }`), no el dataset completo: son
 * decisiones del usuario sobre 61 movimientos que ya existen, y duplicar el JSON en
 * localStorage haría que cualquier cambio futuro en los datos quedara pisado por una copia
 * vieja. El diff, en cambio, se sigue aplicando encima de lo que llegue.
 */

import type { Categoria, Movimiento } from './tipos';
import { esCategoria } from './tipos';

export type Correcciones = Record<string, Categoria>;

export const aplicarCorrecciones = (
  movimientos: Movimiento[],
  correcciones: Correcciones,
): Movimiento[] =>
  movimientos.map((m) => {
    const corregida = correcciones[m.id];
    if (corregida === undefined || corregida === m.categoria) return m;
    return { ...m, categoria: corregida };
  });

/**
 * Lo que sale de localStorage es `unknown`: pudo escribirlo otra versión de la app, o el
 * usuario a mano desde la consola. Una categoría que ya no existe en el vocabulario se
 * descarta en vez de colarse al dominio — es exactamente el caso que `esCategoria` protege.
 */
export const leerCorrecciones = (crudo: unknown): Correcciones => {
  if (typeof crudo !== 'object' || crudo === null || Array.isArray(crudo)) return {};

  const limpias: Correcciones = {};
  for (const [id, categoria] of Object.entries(crudo)) {
    if (typeof categoria === 'string' && esCategoria(categoria)) limpias[id] = categoria;
  }
  return limpias;
};
