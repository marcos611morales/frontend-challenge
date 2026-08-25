import { formatearDia, formatearMonto } from '../dominio/formato';
import type { Categoria, Movimiento } from '../dominio/tipos';
import { CATEGORIAS } from '../dominio/tipos';
import { NOMBRE_ESTADO, NOMBRE_MOTIVO } from './etiquetas';
import { COLUMNAS } from './columnas';

/**
 * Alto fijo por renglón. Es lo que le permite a `useFilasVisibles` calcular cuántos caben,
 * y por lo tanto lo que sostiene la promesa de "sin scroll". Si cambia aquí, la paginación
 * se ajusta sola.
 */
export const ALTURA_FILA = 40;

/** Lápiz de Lucide. Un glifo de texto (✎) hereda la fuente y se ve distinto en cada SO. */
const IconoCorregido = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Categoría corregida por ti"
    className="size-3.5 shrink-0 text-acento"
  >
    <title>Categoría corregida por ti</title>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const Etiqueta = ({ texto, titulo }: { texto: string; titulo?: string }) => (
  <span
    title={titulo}
    className="shrink-0 rounded border border-borde px-1.5 py-px text-[11px] leading-4 text-tinta-suave"
  >
    {texto}
  </span>
);

type PropsRenglon = {
  movimiento: Movimiento;
  onCorregir: (id: string, categoria: Categoria) => void;
  corregido: boolean;
};

const Renglon = ({ movimiento: m, onCorregir, corregido }: PropsRenglon) => {
  /*
   * `txn_061` está excluido *porque* su estado es `en_disputa`: sin esto pintaba la misma
   * palabra dos veces seguidas. Se prefiere el motivo, que dice además por qué no cuenta.
   */
  const motivo = m.excluido ? NOMBRE_MOTIVO[m.motivo] : null;
  const estado = m.estado === 'confirmada' ? null : NOMBRE_ESTADO[m.estado];
  const estadoVisible = estado === motivo ? null : estado;

  return (
  <tr
    style={{ height: ALTURA_FILA }}
    className={`border-b border-borde last:border-0 ${m.excluido ? 'opacity-55' : ''}`}
  >
    <td className="cifras whitespace-nowrap pl-3 pr-2 text-xs text-tinta-suave">
      {formatearDia(m.fecha)}
    </td>

    <td className="max-w-0 pr-2">
      <div className="flex items-center gap-1.5">
        <span className="truncate text-sm" title={m.descripcion}>
          {m.descripcion}
        </span>
        {estadoVisible && <Etiqueta texto={estadoVisible} />}
        {motivo && <Etiqueta texto={motivo} titulo="No cuenta en los totales del mes" />}
      </div>
    </td>

    <td className="pr-2">
      {m.cuenta === null ? (
        <span className="text-xs text-tinta-tenue" title="El agregador no reportó la cuenta">
          Sin cuenta
        </span>
      ) : (
        /* `cifras` alinea los cuatro dígitos finales en columna; sin eso bailan. */
        <span className="cifras truncate text-xs text-tinta-suave" title={m.cuenta}>
          {m.cuenta}
        </span>
      )}
    </td>

    <td className="pr-2">
      <div className="flex items-center gap-1">
        <select
          value={m.categoria ?? ''}
          onChange={(e) => onCorregir(m.id, e.target.value as Categoria)}
          aria-label={`Categoría de ${m.descripcion}`}
          className={`h-7 w-full cursor-pointer rounded border px-1.5 text-xs transition-colors hover:bg-superficie-suave ${
            m.categoria === null
              ? 'border-acento bg-acento-suave font-semibold text-tinta'
              : 'border-transparent text-tinta-suave hover:border-borde'
          }`}
        >
          {m.categoria === null && <option value="">Sin categoría</option>}
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {corregido && <IconoCorregido />}
      </div>
    </td>

    <td
      className={`cifras whitespace-nowrap pr-3 text-right text-sm font-medium ${
        m.monto > 0 ? 'text-ingreso' : 'text-tinta'
      }`}
    >
      {formatearMonto(m.monto, m.moneda)}
    </td>
  </tr>
  );
};

type Props = {
  movimientos: Movimiento[];
  correcciones: Record<string, Categoria>;
  onCorregir: (id: string, categoria: Categoria) => void;
};

export const ListaMovimientos = ({ movimientos, correcciones, onCorregir }: Props) => {
  if (movimientos.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-sm text-tinta-suave">
        Ningún movimiento coincide con estos filtros.
      </p>
    );
  }

  return (
    <table className="w-full table-fixed border-collapse">
      <caption className="sr-only">Movimientos del periodo</caption>
      <colgroup>
        {COLUMNAS.map((c) => (
          <col key={c.clave} style={c.ancho === null ? undefined : { width: c.ancho }} />
        ))}
      </colgroup>
      <tbody>
        {movimientos.map((m) => (
          <Renglon
            key={m.id}
            movimiento={m}
            onCorregir={onCorregir}
            corregido={correcciones[m.id] !== undefined}
          />
        ))}
      </tbody>
    </table>
  );
};
