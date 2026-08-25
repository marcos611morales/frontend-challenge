import { useCallback, useEffect, useState } from 'react';

export const TEMAS = ['claro', 'oscuro'] as const;
export type Tema = (typeof TEMAS)[number];

const CLAVE = 'zenfi:tema';

const esTema = (valor: string | null): valor is Tema =>
  valor === 'claro' || valor === 'oscuro';

/**
 * El tema efectivo ya lo escribió el script en línea de `index.html` antes de pintar.
 * Leerlo del DOM en vez de recalcularlo evita que React y ese script lleguen a
 * conclusiones distintas — que se vería como un parpadeo al montar.
 */
const temaInicial = (): Tema => {
  const puesto = document.documentElement.dataset.tema ?? null;
  return esTema(puesto) ? puesto : 'claro';
};

const hayPreferenciaGuardada = (): boolean => {
  try {
    return esTema(localStorage.getItem(CLAVE));
  } catch {
    return false;
  }
};

export const useTema = () => {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((actual) => {
      const nuevo = actual === 'oscuro' ? 'claro' : 'oscuro';
      // Se guarda sólo al elegir, nunca al montar: escribirlo de entrada convertiría el
      // "sigo al sistema" por defecto en una decisión que el usuario nunca tomó.
      try {
        localStorage.setItem(CLAVE, nuevo);
      } catch {
        // Se pierde la persistencia, no el cambio de tema.
      }
      return nuevo;
    });
  }, []);

  useEffect(() => {
    // Mientras el usuario no haya elegido, el sistema manda — incluso si cambia con la
    // app abierta (macOS lo hace solo al anochecer).
    if (hayPreferenciaGuardada()) return;

    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = (e: MediaQueryListEvent) => setTema(e.matches ? 'oscuro' : 'claro');
    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, [tema]);

  return { tema, alternar };
};
