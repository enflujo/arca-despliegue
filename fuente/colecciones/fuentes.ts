import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca } from '../tipos';
import { flujoCSV, procesarCSV, urlsAEnlacesHTML } from '../utilidades/ayudas';
import { Obra } from './obras';

export type Fuente = {
  id?: ID;
  descripcion: string;
  obras?: Obra[];
};

export type FuenteFuente = {
  id: number;
  name: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof FuenteFuente;

  if (columna === 'name') {
    return urlsAEnlacesHTML(valor);
  }

  return valor;
}

function procesar({ name }: FuenteFuente): Fuente {
  return { descripcion: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Fuente_imagen_1 lista', limpieza);
  await procesarCSV('fuentes', directus, flujo, procesar);
};
// 157 y 56
