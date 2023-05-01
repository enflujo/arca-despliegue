import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Fuente, FuenteFuente } from '../tipos';
import { flujoCSV, procesarCSV, urlsAEnlacesHTML } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof FuenteFuente;

  if (columna === 'name') {
    return urlsAEnlacesHTML(valor);
  }

  return valor;
}

function procesar({ id, name }: FuenteFuente): Fuente {
  return { id, descripcion: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Fuente_imagen_1 lista', limpieza);
  await procesarCSV('fuentes', directus, flujo, procesar);
};
