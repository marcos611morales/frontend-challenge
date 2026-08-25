# Movimientos — reto técnico Zenfi

Una pantalla que resuelve dos cosas sobre un mes de movimientos bancarios:

1. **Entender en unos 10 segundos en qué se fue el dinero.**
2. **Corregir la categoría de un movimiento mal clasificado.**

El enunciado completo está en [`RETO.md`](./RETO.md). El porqué de cada decisión —qué dejé
fuera y qué encontré en los datos— está en [`DECISIONES.md`](./DECISIONES.md), que se lee en
una página.

## Cómo se corre

```bash
corepack enable
pnpm install
pnpm dev
```

Queda en http://localhost:5173.

Requiere **Node >=22.12** (hay un [`.nvmrc`](./.nvmrc)) y **pnpm 10**. Si prefieres npm o yarn,
borra el campo `packageManager` de `package.json`.

| Script           | Qué hace                       |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Servidor de desarrollo         |
| `pnpm build`     | Typecheck + build de producción |
| `pnpm preview`   | Sirve el build                 |
| `pnpm lint`      | ESLint                         |
| `pnpm typecheck` | Sólo TypeScript                |

## Qué se ve

- **Resumen del mes** — ingresos, gasto neto y balance.
- **Donut de gasto por categoría** — top 5 más "Otros". Cada rebanada filtra la lista, incluida
  "Otros", que filtra sus 8 categorías de golpe.
- **Lista paginada** con búsqueda y filtros de cuenta, categoría y tipo, alineados con las
  columnas que filtran para que hagan de encabezado. Los dos que no corresponden a ninguna
  columna —estado y qué movimientos cuentan— viven en el encabezado de la página.
- **Corrección de categoría** en cada renglón. Los totales y el donut se recalculan al instante;
  las correcciones sobreviven al refresh.
- **Los movimientos que no cuentan**, visibles con su motivo.

## Cómo está armado

```
src/
  dominio/      Cero React. Aquí vive todo número que el usuario ve.
    tipos.ts        El JSON sucio y el modelo limpio, uno frente al otro
    normalizar.ts   La única frontera entre los dos
    agregar.ts      Totales y reparto por categoría
    filtrar.ts      Búsqueda, filtros y paginación
    correcciones.ts Las correcciones del usuario
    formato.ts      Moneda y fechas, en un solo lugar
  hooks/        Lo que recuerda algo entre renders
  componentes/  JSX, con los datos ya calculados
  App.tsx       La única capa que conoce las tres
```

`src/data/movimientos.json` **no se edita**: viene sucio a propósito y arreglar el dato de
entrada sería esquivar el problema. Todo se corrige en `normalizar.ts`.

## El invariante

Si la normalización está bien, estos números salen. Sirven de prueba de humo:

```
52 de 61 movimientos · Ingresos $21,650.00 · Gasto neto $84,230.15 · Balance −$62,580.15
```

Los 9 movimientos restantes no desaparecen: se muestran aparte, cada uno con el motivo por el
que no cuenta —duplicado, traspaso propio, fuera del periodo, otra moneda, en disputa o sin
confirmar—. `DECISIONES.md` explica el criterio de cada uno.

## Stack

Vite + React 19 + TypeScript en `strict`, que venían con el template. Encima, sólo **Tailwind
CSS v4** vía `@tailwindcss/vite` — sin `tailwind.config.js` ni PostCSS. Ni router, ni librería
de estado, ni de gráficas, ni de fechas: el donut es SVG a mano y las fechas y la moneda salen
de `Intl`. Con una pantalla y 61 movimientos, cada una de esas dependencias costaba más
explicarla que escribirla.
