import type { Resumen } from '../dominio/agregar';
import type { Ambito, Filtros as Criterios } from '../dominio/filtrar';
import { AMBITOS } from '../dominio/filtrar';
import type { Estado } from '../dominio/tipos';
import { ESTADOS } from '../dominio/tipos';
import { NOMBRE_AMBITO, NOMBRE_ESTADO } from './etiquetas';

/**
 * Los dos filtros que no corresponden a ninguna columna.
 *
 * Viven aquí y no en la fila de filtros porque esa fila hace de encabezado de la tabla:
 * un control de más ahí se lee como el título de una columna que no existe. `estado` se
 * probó dentro de la columna de descripción —es donde salen sus etiquetas— y quedaba
 * flotando sobre celdas vacías.
 *
 * El precio es que se descubren menos, al estar lejos de la lista que filtran. Se paga
 * porque entre los dos sólo discriminan 5 de 61 movimientos, mientras que no poder
 * nombrar las columnas afecta a cada renglón.
 */

const claseSelect =
  'h-7 cursor-pointer rounded-md border border-borde bg-superficie px-2 text-xs text-tinta-suave transition-colors hover:bg-superficie-suave hover:text-tinta';

type Props = {
  criterios: Criterios;
  resumen: Resumen;
  onCambiar: (criterios: Criterios) => void;
};

export const FiltrosGlobales = ({ criterios, resumen, onCambiar }: Props) => {
  const fuera = resumen.movimientosTotales - resumen.movimientosIncluidos;
  const conteo: Record<Ambito, number> = {
    incluidos: resumen.movimientosIncluidos,
    excluidos: fuera,
    todos: resumen.movimientosTotales,
  };

  return (
    <>
      <label>
        <span className="sr-only">Estado del movimiento</span>
        <select
          value={criterios.estado ?? ''}
          onChange={(e) =>
            onCambiar({
              ...criterios,
              estado: e.target.value === '' ? null : (e.target.value as Estado),
            })
          }
          className={claseSelect}
        >
          <option value="">Todo estado</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {NOMBRE_ESTADO[e]}
            </option>
          ))}
        </select>
      </label>

      {/*
       * Reemplaza a la frase "54 de 61 cuentan en el total" y al botón "Ver 7 fuera del
       * total" que vivían aquí por separado: eran el mismo concepto dicho dos veces, una
       * como dato y otra como acción. Los conteos van en la etiqueta porque el número es
       * justo lo que hacía falta saber — cuántos movimientos no está contando el total.
       */}
      <label>
        <span className="sr-only">Qué movimientos se muestran</span>
        <select
          value={criterios.ambito}
          onChange={(e) => onCambiar({ ...criterios, ambito: e.target.value as Ambito })}
          className={`cifras ${claseSelect}`}
        >
          {AMBITOS.map((a) => (
            <option key={a} value={a}>
              {NOMBRE_AMBITO[a]} ({conteo[a]})
            </option>
          ))}
        </select>
      </label>
    </>
  );
};
