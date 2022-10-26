//
import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Rostro = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
};

export type RostroFuente = {
  id: number;
  Nombre: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof RostroFuente;

  if (columna === 'Nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ Nombre: nombre }: RostroFuente): Rostro {
  return { nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Rostro_lista', limpieza);
  await procesarCSV('rostros', directus, flujo, procesar);
};
