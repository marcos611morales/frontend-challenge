/**
 * La única frontera entre el JSON sucio y el resto de la app.
 *
 * Antes de este archivo todo es sospechoso; después, nada vuelve a preguntarse si el
 * monto era string. Si un número de la pantalla sale mal, el bug está aquí — no en la UI.
 *
 * `src/data/movimientos.json` no se toca nunca: arreglar el dato de entrada es hacer
 * trampa con el problema que el reto plantea.
 */

import type {
  ArchivoCrudo,
  DatosMovimiento,
  Movimiento,
  MovimientoCrudo,
  MotivoExclusion,
} from './tipos';
import { esCategoria, esEstado, esMoneda } from './tipos';

export type Normalizacion = {
  /** El mes que el propio archivo declara. No se infiere de la fecha de hoy. */
  periodo: string;
  movimientos: Movimiento[];
  /**
   * Renglones que no se pudieron tipar con confianza. Con este archivo salen 0, pero el
   * resto del código no depende de que así sea: se quedan como `MovimientoCrudo` —el
   * único tipo honesto para algo que no se pudo leer— en vez de colarse al total con un
   * monto inventado.
   */
  ilegibles: MovimientoCrudo[];
};

// ─── Paso 1: tipar ───────────────────────────────────────────────────────────

/**
 * Los 2 únicos montos string del archivo (`txn_024`, `txn_048`) son también los 2 únicos
 * que perdieron el signo. Esa correlación es la evidencia: el agregador serializó a
 * string y en el camino se comió el negativo. Sumarlos como venían movía el gasto del
 * mes 4.7% y el balance 12.5%.
 */
const parsearMonto = (monto: number | string): number | null => {
  if (typeof monto === 'number') return Number.isFinite(monto) ? monto : null;
  const n = Number(monto.trim());
  if (!Number.isFinite(n)) return null;
  return -Math.abs(n);
};

const parsearFila = (crudo: MovimientoCrudo): DatosMovimiento | null => {
  const monto = parsearMonto(crudo.monto);
  if (monto === null) return null;

  if (!esEstado(crudo.estado)) return null;
  if (!esMoneda(crudo.moneda)) return null;

  const fecha = new Date(crudo.fecha);
  if (Number.isNaN(fecha.getTime())) return null;

  // `""` y `null` significan lo mismo —nadie clasificó esto— y colapsan al mismo caso.
  // Una categoría fuera del vocabulario también cae aquí: mejor "Sin categoría", que el
  // usuario puede corregir, que una etiqueta que la gráfica no sabe pintar.
  const categoria = crudo.categoria !== null && esCategoria(crudo.categoria) ? crudo.categoria : null;

  return {
    id: crudo.id,
    fecha,
    descripcion: crudo.descripcion,
    monto,
    moneda: crudo.moneda,
    categoria,
    cuenta: crudo.cuenta,
    estado: crudo.estado,
  };
};

// ─── Paso 2: qué no entra al total, y por qué ────────────────────────────────

/**
 * El periodo se compara sobre el prefijo de la cadena original, no convirtiendo a Date.
 * La fecha viene con su offset (`-06:00`), así que "2026-08" es el mes en el huso del
 * banco — que es el que le importa al usuario. Convertir a Date y leer el mes local
 * haría que el resultado dependiera de dónde se abre la app.
 */
const dentroDelPeriodo = (fechaCruda: string, periodo: string): boolean =>
  fechaCruda.slice(0, periodo.length) === periodo;

/**
 * Un pago a tarjeta propia mueve dinero entre dos cuentas del mismo usuario. Los cargos
 * de esa tarjeta ya están listados uno por uno, así que contarlo cuenta el mismo gasto
 * dos veces. Se detecta por descripción y no por id: si mañana llega otro pago de
 * tarjeta, la regla lo agarra sola.
 */
const esTraspasoPropio = (m: DatosMovimiento): boolean =>
  /^PAGO\s+TARJETA\s+DE\s+CR[EÉ]DITO/i.test(m.descripcion);

/**
 * Motivos que se deciden mirando un solo movimiento. El orden importa sólo si uno
 * cumpliera dos reglas; con estos datos ninguno lo hace, y de todos modos gana el motivo
 * más específico, que es el que mejor se explica en pantalla.
 */
const motivoIndividual = (
  m: DatosMovimiento,
  fechaCruda: string,
  periodo: string,
): MotivoExclusion | null => {
  if (!dentroDelPeriodo(fechaCruda, periodo)) return 'fuera_de_periodo';
  if (m.moneda !== 'MXN') return 'moneda_distinta'; // sin tipo de cambio en los datos
  if (m.estado === 'en_disputa') return 'en_disputa';
  if (esTraspasoPropio(m)) return 'traspaso_propio';
  return null;
};

/**
 * Dos renglones idénticos en fecha-hora, monto, cuenta y descripción son el mismo cargo
 * contado dos veces por el agregador. Se conserva el `confirmada` cuando lo hay:
 * `txn_044`/`txn_045` son el mismo viaje antes y después de liquidar, y el pendiente es
 * la copia que sobra.
 */
const claveDuplicado = (m: DatosMovimiento): string =>
  [m.fecha.getTime(), m.monto, m.cuenta ?? '—', m.descripcion].join('|');

const indicesDuplicados = (datos: DatosMovimiento[], candidatos: Set<number>): Set<number> => {
  const grupos = new Map<string, number[]>();

  datos.forEach((m, i) => {
    if (!candidatos.has(i)) return;
    const clave = claveDuplicado(m);
    const previos = grupos.get(clave);
    if (previos) previos.push(i);
    else grupos.set(clave, [i]);
  });

  const sobran = new Set<number>();
  for (const indices of grupos.values()) {
    if (indices.length < 2) continue;
    const primero = indices[0];
    if (primero === undefined) continue;
    const conservado = indices.find((i) => datos[i]?.estado === 'confirmada') ?? primero;
    for (const i of indices) if (i !== conservado) sobran.add(i);
  }

  return sobran;
};

// ─── El pipeline ─────────────────────────────────────────────────────────────

export const normalizar = (archivo: ArchivoCrudo): Normalizacion => {
  const ilegibles: MovimientoCrudo[] = [];
  const datos: DatosMovimiento[] = [];
  const fechasCrudas: string[] = [];

  for (const crudo of archivo.movimientos) {
    const fila = parsearFila(crudo);
    if (fila === null) {
      ilegibles.push(crudo);
      continue;
    }
    datos.push(fila);
    fechasCrudas.push(crudo.fecha);
  }

  const motivos = datos.map((m, i) => motivoIndividual(m, fechasCrudas[i] ?? '', archivo.periodo));

  const candidatos = new Set(motivos.flatMap((motivo, i) => (motivo === null ? [i] : [])));
  const duplicados = indicesDuplicados(datos, candidatos);

  const movimientos: Movimiento[] = datos.map((m, i) => {
    const motivo = duplicados.has(i) ? 'duplicado' : motivos[i];
    return motivo ? { ...m, excluido: true, motivo } : { ...m, excluido: false };
  });

  // El archivo no viene ordenado: txn_059, txn_060 y txn_061 rompen la cronología.
  // Ordenar es responsabilidad nuestra, y el más reciente primero es lo que espera
  // cualquiera que abra un estado de cuenta.
  movimientos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  return { periodo: archivo.periodo, movimientos, ilegibles };
};
