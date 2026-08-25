import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Cuántos renglones caben en el panel de la lista, medido de verdad.
 *
 * Un tamaño de página constante rompe la promesa de "sin scroll": 14 renglones sobran en
 * una laptop de 13" y desperdician media pantalla en un monitor. Midiendo, la paginación
 * se adapta y el layout nunca cambia de alto.
 *
 * No hay bucle de realimentación porque el nodo observado toma su altura de la grid
 * (`1fr` + `min-h-0`), no de su contenido: cambiar el número de filas no lo redimensiona.
 */
export const useFilasVisibles = (alturaFila: number, minimo = 4, maximo = 40) => {
  const ref = useRef<HTMLDivElement>(null);
  const [filas, setFilas] = useState(minimo);

  useLayoutEffect(() => {
    const nodo = ref.current;
    if (nodo === null) return;

    const medir = (alto: number) => {
      const caben = Math.floor(alto / alturaFila);
      const acotado = Math.min(maximo, Math.max(minimo, caben));
      setFilas((previas) => (previas === acotado ? previas : acotado));
    };

    /*
     * La primera medición es síncrona y en `useLayoutEffect` a propósito: esperar al
     * ResizeObserver pinta un cuadro con el mínimo de filas antes de corregirse, y ese
     * salto se ve como un parpadeo cada vez que carga la página.
     */
    medir(nodo.getBoundingClientRect().height);

    const observador = new ResizeObserver((entradas) => {
      const entrada = entradas[0];
      if (entrada !== undefined) medir(entrada.contentRect.height);
    });

    observador.observe(nodo);
    return () => observador.disconnect();
  }, [alturaFila, minimo, maximo]);

  return [ref, filas] as const;
};
