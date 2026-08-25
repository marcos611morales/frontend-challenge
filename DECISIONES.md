# Decisiones

## Qué mostré y qué dejé fuera

- El reparto del gasto por encima del detalle: con Vivienda en 56.3%, ese contraste es lo
  único que se lee en 10 segundos.
- Donut top 5 + "Otros" en vez de las 13 categorías con gasto: arriba de 6 rebanadas deja de
  comunicar, y las 8 restantes juntas son 14.4%.
- Fuera la comparativa entre meses y toda serie de tiempo: hay un solo mes, 21 días con
  actividad. Un sparkline de 21 puntos decora, no informa.
- Fuera presupuestos y proyecciones: exigen supuestos que nadie me dio.
- El tamaño de página se mide del alto disponible, no es constante: así "sin scroll" se
  cumple en cualquier pantalla, no sólo en la mía.

## Supuestos que tuve que inventar

- "Este mes" es el `periodo` que declara el JSON (2026-08), no la fecha de hoy: es el único
  criterio que el propio archivo define.
- Un cargo `pendiente` sí entra al gasto, marcado distinto: casi siempre se cobra, y sacarlo
  subestimaba el mes en $1,909.
- Un traspaso entre cuentas propias no es gasto, pero un retiro de efectivo sí: el pago de
  tarjeta ya está representado por sus cargos individuales, el retiro no lo está por nada.
- Las correcciones de categoría viven en `localStorage` guardando solo el diff: sobreviven al
  refresh sin backend y sin duplicar los 61 movimientos.

## Qué encontré en los datos y cómo lo manejé

- 7 de 61 quedan fuera del total: `txn_010` (traspaso propio), `txn_022` y `txn_045`
  (duplicados exactos), `txn_032` (USD sin tipo de cambio),
  `txn_059` y `txn_060` (fuera del periodo), `txn_061` (en disputa). Ninguno se borra: se
  muestran aparte con su motivo. Un número que desaparece sin explicación es peor que uno
  incómodo.
- `txn_024` y `txn_048` son los 2 únicos montos string **y** los 2 únicos sin signo — la
  correlación delata el bug. Como venían, movían el gasto 4.7% y el balance 12.5%.
- `txn_028` (+$1,899) netea contra `txn_007`: contarlo como ingreso inflaba los ingresos 8.8%
  con dinero que nunca fue de nadie.
- No corregí `txn_005` (DIDI como Salud) ni `txn_009` (farmacia como Entretenimiento), aunque
  los otros DIDI son Transporte y la otra farmacia es Salud. Son la evidencia de que corregir
  categorías hace falta; arreglarlas en `normalizar.ts` dejaba esa función sin nada que hacer.
- `""` y `null` colapsan a "Sin categoría", pero no adiviné ninguna de las cuatro: elegirlas
  es del usuario.

## Cómo usé IA

- ‹pendiente: Marcos›

## Qué haría con una semana más

- ‹pendiente: se llena con lo que el time-box corte, no antes›

## Tiempo invertido

- ‹pendiente: Marcos›
