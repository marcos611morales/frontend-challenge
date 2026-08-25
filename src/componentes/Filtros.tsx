import type { Filtros as Criterios, Tipo } from '../dominio/filtrar';
import { TIPOS } from '../dominio/filtrar';
import type { Categoria } from '../dominio/tipos';
import { CATEGORIAS } from '../dominio/tipos';
import { REJILLA_COLUMNAS, rellenoCelda } from './columnas';
import { NOMBRE_TIPO } from './etiquetas';

/*
 * Los filtros se alinean con las columnas que filtran, y así hacen de encabezado: sin
 * esto, "Débito ****4821" y "Salud" son dos textos sueltos sin nombre. Por eso la primera
 * opción de cada `select` —la de "sin filtrar"— es el nombre de la columna: en reposo se
 * lee como un título, y al elegir algo se vuelve un filtro.
 *
 * `estado` y `ambito` no corresponden a ninguna columna, así que no están aquí: viven en
 * el encabezado (ver `FiltrosGlobales`). Un control de más en esta fila se leería como el
 * título de una columna que no existe, que es justo lo que se está arreglando.
 */

const claseControl =
  'h-8 w-full min-w-0 cursor-pointer rounded-md border border-borde bg-superficie px-2 text-sm text-tinta transition-colors hover:bg-superficie-suave';

type Props = {
  criterios: Criterios;
  cuentas: string[];
  onCambiar: (criterios: Criterios) => void;
};

export const Filtros = ({ criterios, cuentas, onCambiar }: Props) => {
  const cambiar = <C extends keyof Criterios>(campo: C, valor: Criterios[C]) =>
    onCambiar({ ...criterios, [campo]: valor });

  return (
    <div
      className="grid items-center border-b border-borde py-2"
      style={{ gridTemplateColumns: REJILLA_COLUMNAS }}
    >
      {/* La fecha no tiene filtro, pero sí necesita nombre: si no, la columna queda muda. */}
      <div className={`${rellenoCelda(0)} text-xs font-semibold uppercase tracking-wide text-tinta-suave`}>
        Fecha
      </div>

      <label className={`block min-w-0 ${rellenoCelda(1)}`}>
        <span className="sr-only">Buscar por descripción o categoría</span>
        <input
          type="search"
          value={criterios.busqueda}
          onChange={(e) => cambiar('busqueda', e.target.value)}
          placeholder="Buscar descripción…"
          className="h-8 w-full min-w-0 rounded-md border border-borde bg-superficie px-2.5 text-sm placeholder:text-tinta-tenue"
        />
      </label>

      <div className={`min-w-0 ${rellenoCelda(2)}`}>
        <label>
          <span className="sr-only">Cuenta</span>
          <select
            value={criterios.cuenta ?? ''}
            onChange={(e) => cambiar('cuenta', e.target.value === '' ? null : e.target.value)}
            className={claseControl}
          >
            <option value="">Cuenta</option>
            {cuentas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="sin-cuenta">Sin cuenta</option>
          </select>
        </label>
      </div>

      <div className={`min-w-0 ${rellenoCelda(3)}`}>
        <label>
          <span className="sr-only">Categoría</span>
          <select
            value={criterios.categoria ?? ''}
            onChange={(e) =>
              cambiar('categoria', e.target.value === '' ? null : (e.target.value as Categoria))
            }
            className={claseControl}
          >
            <option value="">Categoría</option>
            <option value="sin-categoria">Sin categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* El tipo filtra el signo del monto, así que su sitio es sobre esa columna. */}
      <div className={`min-w-0 ${rellenoCelda(4)}`}>
        <label>
          <span className="sr-only">Tipo de movimiento</span>
          <select
            value={criterios.tipo}
            onChange={(e) => cambiar('tipo', e.target.value as Tipo)}
            className={claseControl}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {NOMBRE_TIPO[t]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};
