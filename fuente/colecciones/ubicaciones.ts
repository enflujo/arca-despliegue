import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse';
import { ColeccionesArca, Obra } from '../tipos';
import { esNumero, flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Ubicacion = {
  id?: ID;
  nombre: string;
  geo: string;
  obras?: Obra[];
};

export type UbicacionOrigen = {
  id: number;
  name: string;
  Lugar: string;
  latitud: number;
  longitud: number;
  'lugar/ubicación': string;
  Anotación: string;
};

function limpieza(valor: string, contexto: CastingContext): string | number {
  const columna = contexto.column as keyof UbicacionOrigen;

  if (columna === 'Lugar') {
    console.log(valor);
  } else if (columna === 'latitud' || columna === 'longitud') {
    if (esNumero(valor)) {
      return +valor;
    }
  }
  return valor;
}

function procesar(lugar: UbicacionOrigen): Ubicacion {
  return {
    nombre: lugar.Lugar,
    geo: JSON.stringify({
      coordinates: [lugar.longitud, lugar.latitud],
      type: 'Point',
    }),
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('ubicaciones', limpieza);
  await procesarCSV('ubicaciones', directus, flujo, procesar);
};
