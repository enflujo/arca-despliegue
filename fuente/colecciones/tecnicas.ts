import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';
import { Obra } from './obras';

export type Tecnica = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
};

export type TecnicaFuente = {
  id: number;
  name: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof TecnicaFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ name }: TecnicaFuente): Tecnica {
  return { nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Tecnica_1_Lista', limpieza);
  await procesarCSV('tecnicas', directus, flujo, procesar);
};
