/**
 * El ancho de cada columna de la lista, declarado una sola vez.
 *
 * Lo consumen dos cosas que TIENEN que coincidir al pixel: el `<colgroup>` de la tabla y
 * la rejilla de filtros que va encima. Si cada una llevara su propia copia, el día que
 * alguien ensanche una columna los filtros quedarían corridos —y como los filtros hacen
 * de encabezado, un corrimiento no se ve como un bug de CSS sino como un dato en la
 * columna equivocada.
 *
 * `ancho: null` marca la columna que absorbe el resto. Sólo puede haber una.
 */
export type Columna = {
  clave: 'fecha' | 'descripcion' | 'cuenta' | 'categoria' | 'monto';
  ancho: string | null;
};

export const COLUMNAS: readonly Columna[] = [
  { clave: 'fecha', ancho: '4rem' },
  { clave: 'descripcion', ancho: null },
  { clave: 'cuenta', ancho: '9rem' },
  { clave: 'categoria', ancho: '11rem' },
  { clave: 'monto', ancho: '8rem' },
];

/** Para `grid-template-columns`. `minmax(0,1fr)` —y no `1fr`— para que el hijo pueda truncar. */
export const REJILLA_COLUMNAS = COLUMNAS.map((c) => c.ancho ?? 'minmax(0,1fr)').join(' ');

/**
 * El relleno horizontal de cada celda, igual en la tabla y en los filtros. Va aquí y no
 * suelto en cada componente por la misma razón que los anchos.
 */
export const rellenoCelda = (indice: number): string => {
  if (indice === 0) return 'pl-3 pr-2';
  return indice === COLUMNAS.length - 1 ? 'pr-3' : 'pr-2';
};
