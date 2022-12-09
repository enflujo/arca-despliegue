import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type CartelaFilacteria = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
};

export type CartelaFilacteriaFuente = {
  id: number;
  name: string;
};

function limpieza(valor: string, contexto: CastingContext): string | null {
  const columna = contexto.column as keyof CartelaFilacteriaFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar(fila: CartelaFilacteriaFuente): CartelaFilacteria {
  return {
    nombre: fila.name,
    id: fila.id,
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Cartela_filacteria_2_lista', limpieza);
  await procesarCSV('cartelas_filacterias', directus, flujo, procesar);
};
