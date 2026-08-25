import type { Resumen } from '../dominio/agregar';
import { formatearPeriodo } from '../dominio/formato';
import type { Tema } from '../hooks/useTema';
import { BotonTema } from './BotonTema';

type Props = {
  periodo: string;
  resumen: Resumen;
  correcciones: number;
  tema: Tema;
  onVerExcluidos: () => void;
  onRestaurar: () => void;
  onAlternarTema: () => void;
};

export const Encabezado = ({
  periodo,
  resumen,
  correcciones,
  tema,
  onVerExcluidos,
  onRestaurar,
  onAlternarTema,
}: Props) => {
  const fuera = resumen.movimientosTotales - resumen.movimientosIncluidos;

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-lg font-semibold">Movimientos</h1>
        <p className="text-sm text-tinta-suave first-letter:uppercase">{formatearPeriodo(periodo)}</p>
      </div>

      <div className="flex items-center gap-2">
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

        <p className="cifras text-xs text-tinta-suave">
          {resumen.movimientosIncluidos} de {resumen.movimientosTotales} cuentan en el total
        </p>

        {/*
          El botón es el único acceso a los movimientos excluidos, y por eso dice cuántos
          son: un dato que desaparece sin explicación es peor que uno incómodo.
        */}
        {fuera > 0 && (
          <button
            type="button"
            onClick={onVerExcluidos}
            className="cursor-pointer rounded-md border border-borde bg-superficie px-2 py-1 text-xs font-medium text-tinta-suave transition-colors hover:bg-superficie-suave"
          >
            Ver {fuera} fuera del total
          </button>
        )}

        <BotonTema tema={tema} onAlternar={onAlternarTema} />
      </div>
    </header>
  );
};
