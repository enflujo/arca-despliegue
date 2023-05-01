import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, CamposGeneralesColeccion, TipoGestualFuente } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string | null {
  const columna = contexto.column as keyof TipoGestualFuente;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function procesar({ id, nombre }: TipoGestualFuente): CamposGeneralesColeccion {
  return {
    id,
    nombre,
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Tipo_gestual_lista', limpieza);
  await procesarCSV('tipos_gestuales', directus, flujo, procesar);
};
