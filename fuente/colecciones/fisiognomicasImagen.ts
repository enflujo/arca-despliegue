//
import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type FisiognomicaImagen = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
  id_fuente: number;
};

export type FisiognomicaImagenFuente = {
  id: number;
  nombre: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof FisiognomicaImagenFuente;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, nombre }: FisiognomicaImagenFuente): FisiognomicaImagen {
  return { id_fuente: id, nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Fisiognomica_imagen_lista', limpieza);
  await procesarCSV('fisiognomicas_imagen', directus, flujo, procesar);
};
