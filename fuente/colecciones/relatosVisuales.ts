import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type RelatoVisual = {
  id?: ID;
  nombre: string;
  obras?: Obra[];
};

export type RelatoVisualFuente = {
  id: number;
  Nombre: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof RelatoVisualFuente;

  if (columna === 'Nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ Nombre }: RelatoVisualFuente): RelatoVisual {
  return { nombre: Nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Relato_visual_lista', limpieza);
  await procesarCSV('relatos_visuales', directus, flujo, procesar);
};