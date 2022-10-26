//
import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Fisiognomica = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
};

export type FisiognomicaFuente = {
  id: number;
  Nombre: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof FisiognomicaFuente;

  if (columna === 'Nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ Nombre: nombre }: FisiognomicaFuente): Fisiognomica {
  return { nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Fisiognómica_lista', limpieza);
  await procesarCSV('fisiognomicas', directus, flujo, procesar);
};
