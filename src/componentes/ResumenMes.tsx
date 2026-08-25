import type { Resumen } from '../dominio/agregar';
import { formatearTotal } from '../dominio/formato';

type Props = {
  resumen: Resumen;
};

/**
 * Los tres números que contestan "¿cómo me fue este mes?".
 *
 * El gasto neto es el protagonista —es la pregunta del reto— así que va más grande que los
 * otros dos. Los tres van sin signo: la etiqueta ya dice si entró o salió, y un menos
 * delante de "Gasto neto" es redundante. El balance sí lo lleva, porque ahí el signo es la
 * información.
 */
export const ResumenMes = ({ resumen }: Props) => {
  const negativo = resumen.balance < 0;

  return (
    <section
      aria-label="Resumen del mes"
      className="grid grid-cols-3 gap-3 rounded-xl border border-borde bg-superficie px-5 py-4 transition-colors"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">Ingresos</p>
        <p className="cifras mt-0.5 text-2xl font-semibold text-ingreso">
          {formatearTotal(resumen.ingresos)}
        </p>
      </div>

      <div className="border-x border-borde px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">Gasto neto</p>
        <p className="cifras mt-0.5 text-3xl font-bold leading-8 text-gasto">
          {formatearTotal(resumen.gastoNeto)}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">Balance</p>
        <p className="cifras mt-0.5 text-2xl font-semibold">
          {negativo ? '−' : '+'}
          {formatearTotal(resumen.balance)}
        </p>
        <p className="text-xs text-tinta-suave">
          {negativo ? 'Gastaste más de lo que entró' : 'Te sobró dinero'}
        </p>
      </div>
    </section>
  );
};
