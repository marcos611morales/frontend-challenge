import type { Ambito, Filtros as Criterios, Tipo } from '../dominio/filtrar';
import { AMBITOS, TIPOS } from '../dominio/filtrar';
import type { Categoria, Estado } from '../dominio/tipos';
import { NOMBRE_AMBITO, NOMBRE_ESTADO, NOMBRE_TIPO } from './etiquetas';
import { CATEGORIAS, ESTADOS } from '../dominio/tipos';

const claseSelect =
  'h-8 cursor-pointer rounded-md border border-borde bg-superficie px-2 text-sm text-tinta transition-colors hover:bg-superficie-suave';

type Props = {
  criterios: Criterios;
  cuentas: string[];
  onCambiar: (criterios: Criterios) => void;
  onLimpiar: () => void;
  hayFiltros: boolean;
};

export const Filtros = ({ criterios, cuentas, onCambiar, onLimpiar, hayFiltros }: Props) => {
  const cambiar = <C extends keyof Criterios>(campo: C, valor: Criterios[C]) =>
    onCambiar({ ...criterios, [campo]: valor });

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-borde px-3 py-2">
      <label className="relative min-w-44 flex-1">
        <span className="sr-only">Buscar movimiento</span>
        <input
          type="search"
          value={criterios.busqueda}
          onChange={(e) => cambiar('busqueda', e.target.value)}
          placeholder="Buscar por descripción o categoría…"
          className="h-8 w-full rounded-md border border-borde bg-superficie px-2.5 text-sm placeholder:text-tinta-tenue"
        />
      </label>

      <label>
        <span className="sr-only">Categoría</span>
        <select
          value={criterios.categoria ?? ''}
          onChange={(e) =>
            cambiar('categoria', e.target.value === '' ? null : (e.target.value as Categoria))
          }
          className={claseSelect}
        >
          <option value="">Toda categoría</option>
          <option value="sin-categoria">Sin categoría</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Tipo</span>
        <select
          value={criterios.tipo}
          onChange={(e) => cambiar('tipo', e.target.value as Tipo)}
          className={claseSelect}
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {NOMBRE_TIPO[t]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Cuenta</span>
        <select
          value={criterios.cuenta ?? ''}
          onChange={(e) => cambiar('cuenta', e.target.value === '' ? null : e.target.value)}
          className={claseSelect}
        >
          <option value="">Toda cuenta</option>
          {cuentas.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="sin-cuenta">Sin cuenta</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Estado</span>
        <select
          value={criterios.estado ?? ''}
          onChange={(e) =>
            cambiar('estado', e.target.value === '' ? null : (e.target.value as Estado))
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

      <label>
        <span className="sr-only">Ámbito</span>
        <select
          value={criterios.ambito}
          onChange={(e) => cambiar('ambito', e.target.value as Ambito)}
          className={claseSelect}
        >
          {AMBITOS.map((a) => (
            <option key={a} value={a}>
              {NOMBRE_AMBITO[a]}
            </option>
          ))}
        </select>
      </label>

      {hayFiltros && (
        <button
          type="button"
          onClick={onLimpiar}
          className="h-8 cursor-pointer rounded-md px-2 text-sm text-acento underline-offset-2 hover:underline"
        >
          Limpiar
        </button>
      )}
    </div>
  );
};
