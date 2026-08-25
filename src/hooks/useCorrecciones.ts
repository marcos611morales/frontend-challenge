import { useCallback, useEffect, useState } from 'react';

import type { Categoria } from '../dominio/tipos';
import type { Correcciones } from '../dominio/correcciones';
import { leerCorrecciones } from '../dominio/correcciones';

const CLAVE = 'zenfi:correcciones';

/**
 * Las correcciones del usuario, persistidas entre recargas.
 *
 * `localStorage` truena en modo privado de algunos navegadores y cuando la cuota se llena.
 * Que una corrección no se guarde es molesto; que la app entera no arranque por eso es
 * inaceptable — por eso los dos accesos van envueltos.
 */
export const useCorrecciones = () => {
  const [correcciones, setCorrecciones] = useState<Correcciones>(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado === null ? {} : leerCorrecciones(JSON.parse(guardado));
    } catch {
      // Sin acceso a storage o JSON corrupto: se arranca sin correcciones.
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(correcciones));
    } catch {
      // Se pierde la persistencia, no la sesión.
    }
  }, [correcciones]);

  const corregir = useCallback((id: string, categoria: Categoria) => {
    setCorrecciones((previas) => ({ ...previas, [id]: categoria }));
  }, []);

  const restaurar = useCallback(() => setCorrecciones({}), []);

  return { correcciones, corregir, restaurar };
};
