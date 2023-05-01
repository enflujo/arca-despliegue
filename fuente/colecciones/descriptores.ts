import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import slugify from 'slugify';
import { CamposGeneralesColeccion, ColeccionesArca, DescriptoresFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof DescriptoresFuente;

  if (columna === 'description') {
    return valor.trim();
  }

  return valor;
}

function procesar({ description }: DescriptoresFuente): CamposGeneralesColeccion {
  return { nombre: description, slug: slugify(description, { lower: true }) };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Descriptores_1_Lista', limpieza);
  await procesarCSV('descriptores', directus, flujo, procesar);
};
