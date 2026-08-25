import { useCallback, useMemo, useState } from 'react';

import archivo from './data/movimientos.json';
import { repartirGasto, resumir } from './dominio/agregar';
import { aplicarCorrecciones } from './dominio/correcciones';
import type { Filtros as Criterios } from './dominio/filtrar';
import { FILTROS_INICIALES, cuentasDe, filtrar, hayFiltrosActivos, paginar } from './dominio/filtrar';
import { normalizar } from './dominio/normalizar';
import { Encabezado } from './componentes/Encabezado';
import { Filtros } from './componentes/Filtros';
import { GraficaCategorias } from './componentes/GraficaCategorias';
import { ALTURA_FILA, ListaMovimientos } from './componentes/ListaMovimientos';
import { Paginacion } from './componentes/Paginacion';
import { ResumenMes } from './componentes/ResumenMes';
import { useCorrecciones } from './hooks/useCorrecciones';
import { useFilasVisibles } from './hooks/useFilasVisibles';
import { useTema } from './hooks/useTema';

/** El JSON es estático: normalizar una vez al cargar el módulo, no en cada render. */
const { movimientos: originales, periodo } = normalizar(archivo);
const cuentas = cuentasDe(originales);

const App = () => {
  const { correcciones, corregir, restaurar } = useCorrecciones();
  const { tema, alternar: alternarTema } = useTema();
  const [criterios, setCriterios] = useState<Criterios>(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const [refPanel, filas] = useFilasVisibles(ALTURA_FILA);

  /*
   * Las correcciones se aplican antes de agregar, no después de pintar. Por eso corregir
   * una categoría mueve el donut y los totales en el mismo instante — que es lo único que
   * demuestra que la corrección sirve para algo.
   */
  const movimientos = useMemo(
    () => aplicarCorrecciones(originales, correcciones),
    [correcciones],
  );

  const resumen = useMemo(() => resumir(movimientos), [movimientos]);
  const reparto = useMemo(() => repartirGasto(movimientos), [movimientos]);
  const filtrados = useMemo(() => filtrar(movimientos, criterios), [movimientos, criterios]);
  const paginados = useMemo(() => paginar(filtrados, pagina, filas), [filtrados, pagina, filas]);

  // Cambiar un filtro y quedarse en la página 7 deja al usuario mirando una lista vacía.
  const cambiarCriterios = useCallback((nuevos: Criterios) => {
    setCriterios(nuevos);
    setPagina(1);
  }, []);

  const limpiar = useCallback(() => cambiarCriterios(FILTROS_INICIALES), [cambiarCriterios]);

  const seleccionarCategorias = useCallback(
    (categorias: Criterios['categorias']) =>
      cambiarCriterios({ ...criterios, categorias, ambito: 'incluidos' }),
    [cambiarCriterios, criterios],
  );

  return (
    <div className="grid h-dvh grid-rows-[auto_auto_minmax(0,1fr)] gap-3 overflow-hidden p-3">
      <Encabezado
        periodo={periodo}
        resumen={resumen}
        correcciones={Object.keys(correcciones).length}
        criterios={criterios}
        tema={tema}
        hayFiltros={hayFiltrosActivos(criterios)}
        onCambiarCriterios={cambiarCriterios}
        onLimpiar={limpiar}
        onRestaurar={restaurar}
        onAlternarTema={alternarTema}
      />

      <ResumenMes resumen={resumen} />

      <div className="grid min-h-0 grid-cols-[minmax(240px,300px)_minmax(0,1fr)] gap-3">
        <GraficaCategorias
          reparto={reparto}
          seleccion={criterios.categorias}
          onSeleccionar={seleccionarCategorias}
        />

        <section
          aria-label="Movimientos"
          className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-xl border border-borde bg-superficie transition-colors"
        >
          <Filtros criterios={criterios} cuentas={cuentas} onCambiar={cambiarCriterios} />

          {/* El único elemento de la pantalla que puede scrollear, y sólo si no cabe. */}
          <div ref={refPanel} className="min-h-0 overflow-y-auto">
            <ListaMovimientos
              movimientos={paginados.items}
              correcciones={correcciones}
              onCorregir={corregir}
            />
          </div>

          <Paginacion
            pagina={paginados.pagina}
            paginas={paginados.paginas}
            desde={paginados.desde}
            hasta={paginados.hasta}
            total={paginados.total}
            onCambiar={setPagina}
          />
        </section>
      </div>
    </div>
  );
};

export default App;
