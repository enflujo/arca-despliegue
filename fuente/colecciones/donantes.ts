import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, DonanteFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof DonanteFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, name }: DonanteFuente): CamposGeneralesColeccion {
  return { id, nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Donante_2_Lista', limpieza);
  await procesarCSV('donantes', directus, flujo, procesar);
};
