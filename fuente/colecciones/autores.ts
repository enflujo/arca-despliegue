import { CastingContext } from 'csv-parse';
import { flujoCSV, procesarCSV, procesarFechaActividad, urlsAEnlacesHTML, vacio } from '../utilidades/ayudas';
import { Directus } from '@directus/sdk';
import { Actividad, Autor, AutorFuente, ColeccionesArca } from '../tipos';

function limpieza(valor: string, contexto: CastingContext): Actividad | null | string {
  const columna = contexto.column as keyof AutorFuente;

  // Convertir URLS a enlaces de HTML
  if (columna === 'reference' || columna === 'biography') {
    return urlsAEnlacesHTML(valor);
  }

  if (columna === 'activity') {
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
    } else {
      console.log(valor);
    }
    // Si es la columna de actividad y no puede procesar las fechas
    return { desde: vacio, hasta: vacio };
  }

  return valor;
}

async function procesar(autor: AutorFuente): Promise<Autor | null> {
  if (!autor.fullname) return null;
  return {
    id: autor.id,
    nombre: autor.name,
    apellido: autor.lastname,
    desde: autor.activity.desde.fecha,
    desde_anotacion: autor.activity.desde.anotacion,
    hasta: autor.activity.hasta.fecha,
    hasta_anotacion: autor.activity.hasta.anotacion,
    biografia: autor.biography,
    referencia: autor.reference,
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Autores', limpieza);
  await procesarCSV('autores', directus, flujo, procesar);
};
