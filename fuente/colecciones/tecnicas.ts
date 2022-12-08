import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Tecnica = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
  id_fuente: number;
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

function procesar({ id, name }: TecnicaFuente): Tecnica {
  return { id_fuente: id, nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Tecnica_1_Lista', limpieza);
  await procesarCSV('tecnicas', directus, flujo, procesar);
};
