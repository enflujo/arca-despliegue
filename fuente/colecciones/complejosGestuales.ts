import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, ComplejoGestualFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ComplejoGestualFuente;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, nombre }: ComplejoGestualFuente): CamposGeneralesColeccion {
  return { id, nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Complejo_gestual_lista', limpieza);
  await procesarCSV('complejos_gestuales', directus, flujo, procesar);
};
