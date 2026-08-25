/**
 * El vocabulario técnico del JSON traducido a lo que lee una persona.
 *
 * Vive fuera de los componentes por dos razones: Fast Refresh se rompe si un archivo
 * exporta componentes y constantes a la vez, y porque estas tablas las consumen tres
 * componentes distintos — tenerlas en uno de ellos convertiría a ese en dependencia de
 * los otros dos sin razón.
 *
 * Son `Record` completos a propósito: si mañana se agrega un estado o un motivo, esto no
 * compila hasta que alguien decida cómo se llama en pantalla.
 */

import type { Ambito, Tipo } from '../dominio/filtrar';
import type { Estado, MotivoExclusion } from '../dominio/tipos';

export const NOMBRE_AMBITO: Record<Ambito, string> = {
  incluidos: 'En el total',
  excluidos: 'Fuera del total',
  todos: 'Todos',
};

/* `todos` dice "Monto" porque en reposo este select es el encabezado de esa columna. */
export const NOMBRE_TIPO: Record<Tipo, string> = {
  todos: 'Monto',
  ingreso: 'Solo ingresos',
  gasto: 'Solo gastos',
};

export const NOMBRE_ESTADO: Record<Estado, string> = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  programada: 'Programada',
  en_disputa: 'En disputa',
};

export const NOMBRE_MOTIVO: Record<MotivoExclusion, string> = {
  traspaso_propio: 'Traspaso propio',
  duplicado: 'Duplicado',
  moneda_distinta: 'Otra moneda',
  fuera_de_periodo: 'Fuera del mes',
  en_disputa: 'En disputa',
};
