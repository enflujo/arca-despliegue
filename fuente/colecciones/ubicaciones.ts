import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse';
import { ColeccionesArca, Obra } from '../tipos';
import { esNumero, flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Ubicacion = {
  id?: ID;
  id_fuente: number;
  nombre: string;
  anotacion: string | null;
  geo: string;
  obras?: Obra[];
};

export type UbicacionOrigen = {
  id: number;
  name: string;
  Lugar: string;
  latitud: number;
  longitud: number;
  'lugar/ubicación': number;
  Anotación: string;
};

function limpieza(valor: string, contexto: CastingContext): string | number {
  const columna = contexto.column as keyof UbicacionOrigen;

  if (columna === 'Lugar' || columna === 'lugar/ubicación') {
    return valor.trim();
  } else if (columna === 'latitud' || columna === 'longitud') {
    if (esNumero(valor)) {
      return +valor;
    }
  }
  return valor;
}

function procesar(lugar: UbicacionOrigen): Ubicacion {
  return {
    id_fuente: lugar.id,
    nombre: lugar.Lugar,
    anotacion: lugar.Anotación ? lugar.Anotación : null,
    geo: JSON.stringify({
      coordinates: [lugar.longitud, lugar.latitud],
      type: 'Point',
    }),
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Ubicacion_1_ Lista', limpieza);
  await procesarCSV('ubicaciones', directus, flujo, procesar);
};
