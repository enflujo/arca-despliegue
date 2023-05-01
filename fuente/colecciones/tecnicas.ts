import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, TecnicaFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof TecnicaFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, name }: TecnicaFuente): CamposGeneralesColeccion {
  return { id, nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Tecnica_1_Lista', limpieza);
  await procesarCSV('tecnicas', directus, flujo, procesar);
};
