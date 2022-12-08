import { CastingContext } from 'csv-parse';
import { esNumero, flujoCSV, procesarCSV, procesarFechaActividad, urlsAEnlacesHTML, vacio } from '../utilidades/ayudas';
import { Directus, ID } from '@directus/sdk';
import { Actividad, ColeccionesArca, Obra } from '../tipos';

export type Autor = {
  id?: ID;
  id_fuente: number;
  nombre: string;
  apellido: string;
  desde: number | null;
  desde_anotacion: string | null;
  hasta: number | null;
  hasta_anotacion: string | null;
  biografia: string;
  referencia: string;
  status: string;
  obras?: Obra[];
};

export type AutorOrigen = {
  id: number;
  name: string;
  lastname: string;
  fullname: string;
  activity: Actividad;
  biography: string;
  reference: string;
};

function limpieza(valor: string, contexto: CastingContext): Actividad | null | string {
  const columna = contexto.column as keyof AutorOrigen;

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

async function procesar(autor: AutorOrigen): Promise<Autor | null> {
  if (!autor.fullname) return null;
  return {
    status: 'published',
    id_fuente: autor.id,
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
