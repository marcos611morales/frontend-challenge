import type { Reparto } from '../dominio/agregar';
import { formatearPorcentaje, formatearTotal } from '../dominio/formato';
import type { Categoria } from '../dominio/tipos';

/** 5 colores + el gris de "Otros". Más rebanadas que esto y el donut deja de comunicar. */
const COLORES = ['var(--cat-1)', 'var(--cat-2)', 'var(--cat-3)', 'var(--cat-4)', 'var(--cat-5)'];
const COLOR_OTROS = 'var(--cat-otros)';

const RADIO = 42;
const PERIMETRO = 2 * Math.PI * RADIO;

type Seleccion = Categoria | 'sin-categoria' | null;

type Trozo = {
  clave: string;
  etiqueta: string;
  monto: number;
  porcentaje: number;
  color: string;
  /** `null` en "Otros": agrupa varias categorías, así que no filtra por ninguna. */
  filtro: Seleccion;
  /** Largo del arco y dónde empieza, en unidades de perímetro. */
  largo: number;
  desfase: number;
};

type TrozoSinArco = Omit<Trozo, 'largo' | 'desfase'>;

const construirTrozos = (reparto: Reparto): Trozo[] => {
  const trozos: TrozoSinArco[] = reparto.rebanadas.map((r, i) => ({
    clave: r.categoria ?? 'sin-categoria',
    etiqueta: r.categoria ?? 'Sin categoría',
    monto: r.monto,
    porcentaje: r.porcentaje,
    color: COLORES[i] ?? COLOR_OTROS,
    filtro: r.categoria ?? 'sin-categoria',
  }));

  if (reparto.otros) {
    trozos.push({
      clave: 'otros',
      etiqueta: `Otros (${reparto.otros.categorias})`,
      monto: reparto.otros.monto,
      porcentaje: reparto.otros.porcentaje,
      color: COLOR_OTROS,
      filtro: null,
    });
  }

  /*
   * Los arcos se acumulan aquí y no dentro del `.map()` del JSX: mutar una variable
   * durante el render produce un donut distinto en cada pasada de StrictMode.
   */
  let recorrido = 0;
  return trozos.map((t) => {
    const largo = (t.porcentaje / 100) * PERIMETRO;
    const desfase = -recorrido;
    recorrido += largo;
    return { ...t, largo, desfase };
  });
};

type Props = {
  reparto: Reparto;
  seleccion: Seleccion;
  onSeleccionar: (categoria: Seleccion) => void;
};

export const GraficaCategorias = ({ reparto, seleccion, onSeleccionar }: Props) => {
  const trozos = construirTrozos(reparto);
  const dominante = trozos[0];

  // Un lector de pantalla no puede "ver" el donut. Esta frase es el gráfico en palabras.
  const resumenHablado = trozos
    .map((t) => `${t.etiqueta}, ${formatearPorcentaje(t.porcentaje)}`)
    .join('. ');

  return (
    <section
      aria-label="Gasto por categoría"
      className="flex min-h-0 flex-col rounded-xl border border-borde bg-superficie p-4 transition-colors"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">
        En qué se fue
      </h2>

      <div className="relative mx-auto my-4 w-full max-w-[196px] shrink-0">
        <svg viewBox="0 0 100 100" role="img" aria-label={`Reparto del gasto. ${resumenHablado}`}>
          <g transform="rotate(-90 50 50)">
            {trozos.map((t) => (
              <circle
                key={t.clave}
                cx="50"
                cy="50"
                r={RADIO}
                fill="none"
                stroke={t.color}
                strokeWidth={t.filtro !== null && t.filtro === seleccion ? 20 : 15}
                strokeDasharray={`${t.largo} ${PERIMETRO - t.largo}`}
                strokeDashoffset={t.desfase}
                className="transition-[stroke-width] duration-200"
              />
            ))}
          </g>
        </svg>

        {dominante && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="cifras text-2xl font-bold leading-none">
              {formatearPorcentaje(dominante.porcentaje)}
            </span>
            <span className="mt-1 max-w-[80%] truncate text-center text-xs text-tinta-suave">
              {dominante.etiqueta}
            </span>
          </div>
        )}
      </div>

      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {trozos.map((t) => {
          const activo = t.filtro !== null && t.filtro === seleccion;

          return (
            <li key={t.clave}>
              <button
                type="button"
                disabled={t.filtro === null}
                aria-pressed={activo}
                onClick={() => onSeleccionar(activo ? null : t.filtro)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors enabled:cursor-pointer enabled:hover:bg-superficie-suave disabled:cursor-default aria-pressed:bg-acento-suave"
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: t.color }}
                />
                <span className="flex-1 truncate text-sm">{t.etiqueta}</span>
                <span className="cifras text-xs text-tinta-suave">{formatearTotal(t.monto)}</span>
                <span className="cifras w-12 text-right text-sm font-semibold">
                  {formatearPorcentaje(t.porcentaje)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
