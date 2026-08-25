type Props = {
  pagina: number;
  paginas: number;
  desde: number;
  hasta: number;
  total: number;
  onCambiar: (pagina: number) => void;
};

const claseBoton =
  'flex size-7 items-center justify-center rounded-md border border-borde text-sm transition-colors enabled:cursor-pointer enabled:hover:bg-superficie-suave disabled:opacity-40';

export const Paginacion = ({ pagina, paginas, desde, hasta, total, onCambiar }: Props) => (
  <nav
    aria-label="Paginación de movimientos"
    className="flex items-center justify-between border-t border-borde px-3 py-2"
  >
    <p className="cifras text-xs text-tinta-suave" aria-live="polite">
      {total === 0 ? 'Sin resultados' : `${desde}–${hasta} de ${total}`}
    </p>

    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className={claseBoton}
        disabled={pagina <= 1}
        onClick={() => onCambiar(pagina - 1)}
        aria-label="Página anterior"
      >
        ‹
      </button>
      <span className="cifras px-1 text-xs text-tinta-suave">
        {pagina} / {paginas}
      </span>
      <button
        type="button"
        className={claseBoton}
        disabled={pagina >= paginas}
        onClick={() => onCambiar(pagina + 1)}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </div>
  </nav>
);
