//
import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, FisiognomicaImagenFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof FisiognomicaImagenFuente;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, nombre }: FisiognomicaImagenFuente): CamposGeneralesColeccion {
  return { id, nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Fisiognomica_imagen_lista', limpieza);
  await procesarCSV('fisiognomicas_imagen', directus, flujo, procesar);
};
