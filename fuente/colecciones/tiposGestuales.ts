import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type TipoGestual = {
  id?: ID;
  nombre: string;
  id_fuente: number;
  obras?: Obra[];
};

export type TiposGestualFuente = {
  id: number;
  nombre: string;
};

function limpieza(valor: string, contexto: CastingContext): string | null {
  const columna = contexto.column as keyof TiposGestualFuente;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar(fila: TiposGestualFuente): TipoGestual {
  return {
    nombre: fila.nombre,
    id_fuente: fila.id,
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Tipo_gestual_lista', limpieza);
  await procesarCSV('tipos_gestuales', directus, flujo, procesar);
};
