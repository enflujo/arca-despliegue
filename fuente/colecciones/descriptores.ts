import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import slugify from 'slugify';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Descriptor = {
  id?: ID;
  nombre: string;
  slug: string;
  descripcion?: string;
  obras?: Obra[];
};

export type DescriptoresFuente = {
  id: number;
  description: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof DescriptoresFuente;

  if (columna === 'description') {
    return valor.trim();
  }

  return valor;
}

function procesar({ description }: DescriptoresFuente): Descriptor {
  return { nombre: description, slug: slugify(description, { lower: true }) };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Descriptores_1_Lista', limpieza);
  await procesarCSV('descriptores', directus, flujo, procesar);
};
