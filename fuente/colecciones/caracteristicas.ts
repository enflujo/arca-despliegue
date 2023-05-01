import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import slugify from 'slugify';
import { CamposGeneralesColeccion, CaracteristicasFuente, ColeccionesArca } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof CaracteristicasFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ name }: CaracteristicasFuente): CamposGeneralesColeccion {
  return { nombre: name, slug: slugify(name, { lower: true }) };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Caracteristicas_particulares_2_lista', limpieza);
  await procesarCSV('caracteristicas', directus, flujo, procesar);
};
