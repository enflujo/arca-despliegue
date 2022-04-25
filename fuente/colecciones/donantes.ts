import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';
import { Obra } from './obras';

export type Donante = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
};

export type DonanteFuente = {
  id: number;
  name: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof DonanteFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ name }: DonanteFuente): Donante {
  return { nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Donante_2_Lista', limpieza);
  await procesarCSV('donantes', directus, flujo, procesar);
};
