import type { Resumen } from '../dominio/agregar';
import type { Filtros as Criterios } from '../dominio/filtrar';
import { formatearPeriodo } from '../dominio/formato';
import type { Tema } from '../hooks/useTema';
import { BotonTema } from './BotonTema';
import { FiltrosGlobales } from './FiltrosGlobales';

type Props = {
  periodo: string;
  resumen: Resumen;
  correcciones: number;
  criterios: Criterios;
  tema: Tema;
  hayFiltros: boolean;
  onCambiarCriterios: (criterios: Criterios) => void;
  onLimpiar: () => void;
  onRestaurar: () => void;
  onAlternarTema: () => void;
};

export const Encabezado = ({
  periodo,
  resumen,
  correcciones,
  criterios,
  tema,
  hayFiltros,
  onCambiarCriterios,
  onLimpiar,
  onRestaurar,
  onAlternarTema,
}: Props) => (
  <header className="flex items-center justify-between gap-3">
    <div className="flex items-baseline gap-2.5">
      <h1 className="text-lg font-semibold">Movimientos</h1>
      <p className="text-sm text-tinta-suave first-letter:uppercase">{formatearPeriodo(periodo)}</p>
    </div>

    <div className="flex items-center gap-2">
      {hayFiltros && (
        <button
          type="button"
          onClick={onLimpiar}
          className="cursor-pointer rounded-md px-2 py-1 text-xs text-acento underline-offset-2 hover:underline"
        >
          Limpiar filtros
        </button>
      )}

      {correcciones > 0 && (
        <button
          type="button"
          onClick={onRestaurar}
          className="cursor-pointer rounded-md px-2 py-1 text-xs text-tinta-suave underline-offset-2 hover:underline"
        >
          {correcciones === 1 ? '1 categoría corregida' : `${correcciones} categorías corregidas`}
          {' · Deshacer'}
        </button>
      )}

      <FiltrosGlobales criterios={criterios} resumen={resumen} onCambiar={onCambiarCriterios} />
      <BotonTema tema={tema} onAlternar={onAlternarTema} />
    </div>
  </header>
);
