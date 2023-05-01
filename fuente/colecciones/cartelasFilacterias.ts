import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { CartelaFilacteriaFuente, ColeccionesArca, CamposGeneralesColeccion } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string | null {
  const columna = contexto.column as keyof CartelaFilacteriaFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar(fila: CartelaFilacteriaFuente): CamposGeneralesColeccion {
  return {
    nombre: fila.name,
    id: fila.id,
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Cartela_filacteria_2_lista', limpieza);
  await procesarCSV('cartelas_filacterias', directus, flujo, procesar);
};
