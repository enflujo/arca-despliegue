import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra, ObraFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ObraFuente;

  if (columna === 'título') {
    return valor.trim();
  }

  return valor;
}

async function procesar(fila: ObraFuente, directus: Directus<ColeccionesArca>): Promise<Obra | null> {
  const respuesta: Obra = {
    titulo: fila.título,
  };

  const { data: fuenteImagen } = await directus
    .items('fuentes')
    .readByQuery({ filter: { descripcion: { _eq: fila.Fuente_imagen } } });

  const { data: autor } = await directus
    .items('autores')
    .readByQuery({ filter: { id_fuente: { _eq: fila.autores_id } } });

  const { data: tecnica } = await directus.items('tecnicas').readByQuery({ filter: { nombre: { _eq: fila.Tecnica } } });
  const { data: complejoGestual } = await directus
    .items('complejos_gestuales')
    .readByQuery({ filter: { nombre: { _eq: fila.Complejo_gestual_lista } } });

  if (fuenteImagen?.length) {
    respuesta.fuente = fuenteImagen[0]?.id;
  }

  if (autor?.length && autor[0]?.id) {
    respuesta.autores = [{ autores_id: autor[0].id }];
  }

  if (tecnica?.length && tecnica[0]?.id) {
    respuesta.tecnicas = [{ tecnicas_id: tecnica[0].id }];
  }

  if (complejoGestual?.length && complejoGestual[0]?.id) {
    respuesta.complejo_gestual = complejoGestual[0].id;
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Registro general', limpieza);
  await procesarCSV('obras', directus, flujo, procesar);
};
