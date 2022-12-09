import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

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

function procesar({ id, name }: DonanteFuente): Donante {
  return { id, nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Donante_2_Lista', limpieza);
  await procesarCSV('donantes', directus, flujo, procesar);
};
