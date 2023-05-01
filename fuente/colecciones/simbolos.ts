import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import slugify from 'slugify';
import { CamposGeneralesColeccion, ColeccionesArca, SimbolosFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof SimbolosFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ name }: SimbolosFuente): CamposGeneralesColeccion {
  return { nombre: name, slug: slugify(name, { lower: true }) };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Simbolos_2_lista', limpieza);
  await procesarCSV('simbolos', directus, flujo, procesar);
};
