import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, RelatoVisualFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof RelatoVisualFuente;

  if (columna === 'Nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, Nombre }: RelatoVisualFuente): CamposGeneralesColeccion {
  return { id, nombre: Nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Relato_visual_lista', limpieza);
  await procesarCSV('relatos_visuales', directus, flujo, procesar);
};
