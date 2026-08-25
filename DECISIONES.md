# Decisiones

## Qué mostré y qué dejé fuera

- El reparto del gasto por encima del detalle: con Vivienda en 57.6%, ese contraste es lo
  único que se lee en 10 segundos.
- Donut top 5 + "Otros" en vez de las 13 categorías con gasto: arriba de 6 rebanadas deja de
  comunicar, y las 8 restantes juntas son 14.0%.
- Fuera la comparativa entre meses y toda serie de tiempo: hay un solo mes, 21 días con
  actividad. Un sparkline de 21 puntos decora, no informa.
- Fuera presupuestos y proyecciones: exigen supuestos que nadie me dio.

## Supuestos que tuve que inventar

- "Este mes" es el `periodo` que declara el JSON (2026-08), no la fecha de hoy: es el único
  criterio que el archivo define.
- Un cargo `pendiente` o `programada` no entra al gasto: puede no liquidarse nunca, y la
  pantalla responde en qué se fue el dinero, no cuánto van a cobrarte.
- Un traspaso entre cuentas propias no es gasto, pero un retiro de efectivo sí: el pago de
  tarjeta ya está representado por sus cargos individuales, el retiro no lo está por nada.
- Las correcciones de categoría viven en `localStorage` guardando solo el diff: sobreviven al
  refresh sin backend y sin duplicar los 61 movimientos.

## Qué encontré en los datos y cómo lo manejé

- 9 de 61 quedan fuera del total: traspaso propio (`txn_010`), duplicados (`txn_022`,
  `txn_045`), USD sin tipo de cambio (`txn_032`), fuera del periodo (`txn_059`, `txn_060`),
  en disputa (`txn_061`) y sin confirmar (`txn_053`, `txn_056`). Ninguno se borra: se
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

## Cómo usé IA

- Empecé por el contexto, no por el código: le di RETO.md y los 61 movimientos a Claude Code
  para producir un `CLAUDE.md` con el alcance, el invariante numérico y una regla dura — si el
  enunciado no lo dice, se pregunta; no se infiere.
- Lo repetible lo volví skills del repo (`dominio-primero`, `decisiones`) en vez de reescribir
  las mismas instrucciones en cada prompt. La UI la apoyé en `ui-ux-pro-max`.
- Le pedí un plan de ejecución, lo revisé y recorté antes de ejecutarlo. Los 25 hallazgos de
  datos los decidí uno por uno.

## Qué haría con una semana más

## Qué haría con una semana más

- Tests sobre `dominio/`: es el único código donde un bug no truena nada, solo produce un
  número equivocado en silencio. El invariante que hoy verifico a mano (52 de 61, gasto
  $84,230.15) es el primer test, no un ejercicio nuevo.
- Móvil: el tamaño de página se calcula del alto y el layout es una grid de `100dvh`; en
  pantalla angosta hay que apilar donut y lista. Fuera porque `RETO.md` dice que no se evalúa.


## Tiempo invertido

- 3 h 30 de las 4 h: 1 h de análisis de `movimientos.json`, 45 min de contexto y plan, 1 h 30
  de ejecución, 15 min de deploy. Poner el análisis por delante es lo que abarató la ejecución.
