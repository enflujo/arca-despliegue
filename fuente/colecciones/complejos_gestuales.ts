import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type ComplejoGestual = {
  id?: ID;
  nombre: string;
  descripcion?: string;
  obras?: Obra[];
};

export type ComplejoGestualFuente = {
  id: number;
  nombre: string;
};

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ComplejoGestualFuente;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ nombre }: ComplejoGestualFuente): ComplejoGestual {
  return { nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Complejo_gestual_lista', limpieza);
  await procesarCSV('complejos_gestuales', directus, flujo, procesar);
};
