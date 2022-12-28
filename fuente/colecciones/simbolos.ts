import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import slugify from 'slugify';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Simbolo = {
  id?: ID;
  nombre: string;
  slug: string;
  descripcion?: string;
  obras?: Obra[];
};

export type SimbolosFuente = {
  id: number;
  name: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof SimbolosFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ name }: SimbolosFuente): Simbolo {
  return { nombre: name, slug: slugify(name, { lower: true }) };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Simbolos_2_lista', limpieza);
  await procesarCSV('simbolos', directus, flujo, procesar);
};
