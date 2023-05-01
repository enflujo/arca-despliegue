//
import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, FisiognomicaFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof FisiognomicaFuente;

  if (columna === 'Nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, Nombre: nombre }: FisiognomicaFuente): CamposGeneralesColeccion {
  return { id, nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Fisiognómica_lista', limpieza);
  await procesarCSV('fisiognomicas', directus, flujo, procesar);
};
