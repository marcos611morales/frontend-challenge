/**
 * La frontera de tipos del proyecto.
 *
 * Arriba, `MovimientoCrudo` refleja el JSON tal cual viene del agregador — con todo lo
 * que trae mal. Abajo, `Movimiento` ya no admite ambigüedad. El único lugar donde se
 * cruza de uno al otro es `normalizar.ts`.
 *
 * Los nombres de campo son los mismos del JSON a propósito (`monto`, no `amount`):
 * normalizar cambia tipos, nunca nombres. Un mapeo de nombres obliga a recordar la
 * traducción en cada archivo, y el primer bug sería un `amount` sin normalizar.
 */

// ─── Lo sucio ────────────────────────────────────────────────────────────────

/**
 * El JSON, sin mentiras piadosas. Si aquí se declarara `monto: number` para ahorrar
 * trabajo, el error aparecería a la hora de sumar, en silencio y sin tipo que lo ataje.
 */
export type MovimientoCrudo = {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number | string; // txn_024 y txn_048 vienen como string
  moneda: string; // de facto "MXN" | "USD", pero todavía no se promete
  categoria: string | null; // null ×3 y "" ×1
  cuenta: string | null; // sólo txn_061
  estado: string;
};

export type ArchivoCrudo = {
  periodo: string;
  generado_en: string;
  movimientos: MovimientoCrudo[];
};

// ─── Los vocabularios cerrados ───────────────────────────────────────────────

/**
 * Fuente única de las categorías: de esta línea salen el tipo `Categoria` y las opciones
 * del `<select>` de corrección. Tenerlas escritas dos veces es exactamente el bug que
 * dispararía la corrección — el usuario elegiría una categoría que la gráfica no sabe
 * pintar.
 *
 * Son las 16 que aparecen en el JSON, ni una más. Inventar categorías "mejores" sería
 * rediseñar la taxonomía del agregador, que no es lo que se pidió.
 */
export const CATEGORIAS = [
  'Comida',
  'Comisiones',
  'Compras',
  'Efectivo',
  'Entretenimiento',
  'Ingresos',
  'Pagos',
  'Salud',
  'Seguros',
  'Servicios',
  'Supermercado',
  'Suscripciones',
  'Transferencias',
  'Transporte',
  'Viajes',
  'Vivienda',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const ESTADOS = ['confirmada', 'pendiente', 'programada', 'en_disputa'] as const;
export type Estado = (typeof ESTADOS)[number];

export const MONEDAS = ['MXN', 'USD'] as const;
export type Moneda = (typeof MONEDAS)[number];

/**
 * Por qué un movimiento no entra al total. Es una union y no un `string` porque cada
 * motivo se explica distinto en la UI, y porque un motivo mal escrito debe ser un error
 * de compilación, no una etiqueta vacía en pantalla.
 */
export const MOTIVOS_EXCLUSION = [
  'traspaso_propio',
  'duplicado',
  'moneda_distinta',
  'fuera_de_periodo',
  'en_disputa',
  'no_confirmada',
] as const;

export type MotivoExclusion = (typeof MOTIVOS_EXCLUSION)[number];

/**
 * Estados en los que el dinero todavía no se movió de verdad.
 *
 * Un cargo pendiente puede no liquidarse nunca —se cae la autorización, el comercio la
 * revierte— y uno programado es una intención a futuro. Sumarlos al gasto del mes
 * responde "cuánto te van a cobrar", no "en qué se te fue el dinero", que es la pregunta
 * de esta pantalla.
 *
 * Va como constante y no como un `if` suelto porque la misma lista la necesitan la regla
 * de exclusión y cualquiera que después pregunte "¿y por qué éste no cuenta?".
 */
export const ESTADOS_SIN_CONFIRMAR: readonly Estado[] = ['pendiente', 'programada'];

// ─── Lo limpio ───────────────────────────────────────────────────────────────

/**
 * Los datos de un movimiento ya tipados, sin la decisión de si entra al total o no.
 * Existe para que `normalizar.ts` pueda construir la union discriminada de abajo una
 * sola vez, al final — en vez de crear un movimiento incluido y después "convertirlo"
 * a excluido, que es donde se cuelan los `as`.
 */
export type DatosMovimiento = {
  id: string;
  fecha: Date;
  descripcion: string;
  /**
   * Negativo = salió dinero. Siempre, sin excepciones.
   * Expresado en `moneda`, que no siempre es MXN — por eso `txn_032` se excluye del total
   * en vez de sumarse como si 12 USD fueran 12 pesos.
   */
  monto: number;
  moneda: Moneda;
  /**
   * `null` sobrevive a propósito: "Sin categoría" no es un dato roto, es el caso de uso
   * de la corrección. Adivinar la categoría aquí dejaría esa función sin nada que hacer.
   */
  categoria: Categoria | null;
  cuenta: string | null;
  estado: Estado;
};

/**
 * Union discriminada, no dos campos opcionales: un movimiento excluido SIEMPRE trae
 * motivo, y uno incluido nunca. Con `{ excluido?: boolean; motivo?: string }` el
 * compilador dejaría pasar la combinación imposible.
 */
export type Movimiento =
  | (DatosMovimiento & { excluido: false })
  | (DatosMovimiento & { excluido: true; motivo: MotivoExclusion });

export type MovimientoIncluido = Extract<Movimiento, { excluido: false }>;
export type MovimientoExcluido = Extract<Movimiento, { excluido: true }>;

// ─── Guards ──────────────────────────────────────────────────────────────────

export const esCategoria = (valor: string): valor is Categoria =>
  (CATEGORIAS as readonly string[]).includes(valor);

export const esEstado = (valor: string): valor is Estado =>
  (ESTADOS as readonly string[]).includes(valor);

export const esMoneda = (valor: string): valor is Moneda =>
  (MONEDAS as readonly string[]).includes(valor);
