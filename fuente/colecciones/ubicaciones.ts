import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse';
import { ColeccionesArca, Ubicacion, UbicacionFuente } from '../tipos';
import { esNumero, flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string | number {
  const columna = contexto.column as keyof UbicacionFuente;

  if (columna === 'Lugar' || columna === 'lugar/ubicación') {
    return valor.trim();
  } else if (columna === 'latitud' || columna === 'longitud') {
    if (esNumero(valor)) {
      return +valor;
    }
  }
  return valor;
}

async function procesar(lugar: UbicacionFuente, directus: Directus<ColeccionesArca>): Promise<Ubicacion> {
  const respuesta: Ubicacion = {
    id: lugar.id,
    nombre: lugar.Lugar,
    anotacion: lugar.Anotación ? lugar.Anotación : null,
  };

  if (lugar['lugar/ubicación'].length) {
    const { data: ciudad } = await directus
      .items('ciudades')
      .readByQuery({ filter: { nombre: { _eq: lugar['lugar/ubicación'] } } });

    if (ciudad?.length) {
      respuesta.ciudad = ciudad[0]?.id;
    } else {
      console.log('No se encontró la ciudad', lugar);
    }
  } else {
    console.log('La fila no tiene nada en el campo "lugar/ubicación"', lugar);
  }

  if (lugar.longitud && lugar.latitud) {
    respuesta.geo = JSON.stringify({
      coordinates: [lugar.longitud, lugar.latitud],
      type: 'Point',
    });
  } else if (lugar['lugar/ubicación'] !== '(Sin datos)') {
    console.log('Problemas con las coordenadas', lugar);
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Ubicacion_1_ Lista', limpieza);
  await procesarCSV('ubicaciones', directus, flujo, procesar);
};
