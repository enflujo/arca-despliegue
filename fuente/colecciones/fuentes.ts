import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV, urlsAEnlacesHTML } from '../utilidades/ayudas';

export type Fuente = {
  id?: ID;
  descripcion: string;
  obras?: Obra[];
  id_fuente: ID;
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

function procesar({ id, name }: FuenteFuente): Fuente {
  return { id_fuente: id, descripcion: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Fuente_imagen_1 lista', limpieza);
  await procesarCSV('fuentes', directus, flujo, procesar);
};
// 157 y 56
