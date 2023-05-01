import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { Actividad, ActividadObjeto, ColeccionesArca, Personaje, PersonajeFuente } from '../tipos';
import { esNumero, flujoCSV, procesarCSV, procesarFechaActividad, urlsAEnlacesHTML, vacio } from '../utilidades/ayudas';

function limpieza(
  valor: string,
  contexto: CastingContext
): Personaje | null | string | number | ActividadObjeto | Actividad {
  const columna = contexto.column as keyof PersonajeFuente;

  // Convertir URLS a enlaces de HTML
  if (columna === 'source') {
    return urlsAEnlacesHTML(valor);
  }

  if (columna === 'Fecha muerte') {
    if (!valor) return { fecha: null, anotacion: null };
    if (esNumero(valor)) {
      return { fecha: +valor, anotacion: null };
    } else if (valor.toLocaleLowerCase().includes('a')) {
      const partes = valor.split(' ');

      if (esNumero(partes[0])) {
        return { fecha: +partes[0], anotacion: 'a.c.' };
      } else {
        console.log('problema en fecha de muerte personaje:', valor);
        return null;
      }
    } else {
      console.log(columna);
    }

    return { fecha: null, anotacion: null };
  }

  if (columna === 'Fecha beatificación / canonización') {
    if (!valor) return { desde: vacio, hasta: vacio };
    const fechas = valor
      .replace(/(–)/g, '-')
      .split('-')
      .map((v) => v.trim())
      .filter((v) => v.length);

    if (fechas.length) {
      const [desde, hasta] = fechas;
      return {
        desde: procesarFechaActividad(desde),
        hasta: procesarFechaActividad(hasta),
      };
    }
    // Si es la columna de actividad y no puede procesar las fechas
    return { desde: vacio, hasta: vacio };
  }

  return valor;
}

async function procesar(personaje: PersonajeFuente): Promise<Personaje | null> {
  if (!personaje.id) return null;
  return {
    id: personaje.id,
    nombre: personaje.name,
    muerte: personaje['Fecha muerte'].fecha,
    muerte_anotacion: personaje['Fecha muerte'].anotacion,
    beatificacion_canonizacion_desde: personaje['Fecha beatificación / canonización'].desde.fecha,
    beatificacion_canonizacion_desde_anotacion: personaje['Fecha beatificación / canonización'].desde.anotacion,
    beatificacion_canonizacion_hasta: personaje['Fecha beatificación / canonización'].hasta.fecha,
    beatificacion_canonizacion_hasta_anotacion: personaje['Fecha beatificación / canonización'].hasta.anotacion,
    descripcion: personaje.text,
    fuente: personaje.source,
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Info_categorias_personajes_lista', limpieza);
  await procesarCSV('personajes', directus, flujo, procesar);
};
