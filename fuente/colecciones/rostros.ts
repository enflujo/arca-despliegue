//
import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, RostroFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof RostroFuente;

  if (columna === 'Nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, Nombre: nombre }: RostroFuente): CamposGeneralesColeccion {
  return { id, nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Rostro_lista', limpieza);
  await procesarCSV('rostros', directus, flujo, procesar);
};
