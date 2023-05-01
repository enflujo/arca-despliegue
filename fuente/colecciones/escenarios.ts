import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, EscenarioFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof EscenarioFuente;

  if (columna === 'name') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, name }: EscenarioFuente): CamposGeneralesColeccion {
  return { id, nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Escenario_2_Lista', limpieza);
  await procesarCSV('escenarios', directus, flujo, procesar);
};
