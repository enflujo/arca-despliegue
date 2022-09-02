import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra, ObraFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ObraFuente;

  if (columna === 'título') {
    return valor.trim();
  } else if (columna === 'Fuente_imagen') {
  }

  return valor;
}

async function procesar(fila: ObraFuente, directus: Directus<ColeccionesArca>): Promise<Obra | null> {
  const { data: fuenteImagen } = await directus
    .items('fuentes')
    .readByQuery({ filter: { descripcion: { _eq: fila.Fuente_imagen } } });

  const { data: autor } = await directus
    .items('autores')
    .readByQuery({ filter: { id_fuente: { _eq: fila.autores_id } } });

  const respuesta: Obra = {
    titulo: fila.título,
  };

  if (fuenteImagen?.length) {
    respuesta.fuente = fuenteImagen[0]?.id;
  }

  if (autor?.length) {
    if (autor[0]?.id) {
      respuesta.autores = [autor[0].id];
    }
  }

  // return null;
  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Registro general', limpieza);
  await procesarCSV('obras', directus, flujo, procesar);
};
