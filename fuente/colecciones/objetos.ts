import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, ObjetoFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ObjetoFuente;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, nombre }: ObjetoFuente): CamposGeneralesColeccion {
  return { id, nombre };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Objetos_gestos_lista', limpieza);
  await procesarCSV('objetos', directus, flujo, procesar);
};
