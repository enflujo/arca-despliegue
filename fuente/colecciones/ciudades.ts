import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { Ciudad, CiudadFuente, ColeccionesArca } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof CiudadFuente;

  if (columna === 'name' || columna === 'pais') {
    return valor.trim();
  }

  return valor;
}

async function procesar(fila: CiudadFuente, directus: Directus<ColeccionesArca>): Promise<Ciudad> {
  const respuesta: Ciudad = { nombre: fila.name, id: fila.id };

  if (fila.pais.length) {
    const { data: pais } = await directus.items('paises').readByQuery({ filter: { nombre: { _eq: fila.pais } } });

    if (pais?.length) {
      respuesta.pais = pais[0]?.id;
    }
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Ciudades_1_lista', limpieza);
  await procesarCSV('ciudades', directus, flujo, procesar);
};
