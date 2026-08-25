import type { Tema } from '../hooks/useTema';

/* Iconos de Lucide, en línea. Dos trazos no justifican una dependencia de iconos. */

const IconoSol = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="size-4">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const IconoLuna = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

type Props = {
  tema: Tema;
  onAlternar: () => void;
};

export const BotonTema = ({ tema, onAlternar }: Props) => {
  const destino = tema === 'claro' ? 'oscuro' : 'claro';
  const etiqueta = `Cambiar a tema ${destino}`;

  return (
    <button
      type="button"
      onClick={onAlternar}
      title={etiqueta}
      /*
       * El icono es decorativo (`aria-hidden`) y la etiqueta vive en el botón: un lector
       * de pantalla anuncia la acción, no el dibujo. `aria-pressed` estaría mal aquí —
       * esto no es un interruptor de dos estados con nombre fijo, es una acción cuyo
       * destino cambia.
       */
      aria-label={etiqueta}
      className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-borde bg-superficie text-tinta-suave transition-colors hover:bg-superficie-suave hover:text-tinta"
    >
      {tema === 'claro' ? <IconoLuna /> : <IconoSol />}
    </button>
  );
};
