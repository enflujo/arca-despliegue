import { CastingContext } from 'csv-parse';
import { esNumero, flujoCSV, procesarCSV, urlsAEnlacesHTML } from '../utilidades/ayudas';
import { Directus, ID } from '@directus/sdk';
import { ColeccionesArca, Obra } from '../tipos';

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

export type ActividadObjeto = {
  fecha: number | null;
  anotacion: string | null;
};

export type Actividad = {
  desde: ActividadObjeto;
  hasta: ActividadObjeto;
};

export type AutorOrigen = {
  id: number;
  name: string;
  lastname: string;
  activity: Actividad;
  biography: string;
  reference: string;
};

const vacio = { fecha: null, anotacion: null } as ActividadObjeto;

function procesarFechaActividad(fecha: string): ActividadObjeto {
  if (!fecha) return vacio;
  if (esNumero(fecha)) return { fecha: +fecha, anotacion: null };

  if (fecha.includes('c')) {
    const [anotacion, fechaDentro] = fecha.split(' ');
    const fechaEn = procesarFechaActividad(fechaDentro);

    if (fechaEn) {
      return { fecha: fechaEn.fecha, anotacion: 'ca' };
    }
  }

  if (fecha.includes('s')) return { fecha: null, anotacion: 'sf' };

  return vacio;
}

function limpieza(valor: string, contexto: CastingContext): Actividad | null | string {
  const columna = contexto.column as keyof AutorOrigen;

  // Si no es la columna de actividad y el valor esta vació, salir y devolver `null`.
  if (!valor.length && columna !== 'activity') return null;
  // Convertir URLS a enlaces de HTML
  if (columna === 'reference' || columna === 'biography') {
    return urlsAEnlacesHTML(valor);
  }

  if (columna === 'activity') {
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
    return { desde: vacio, hasta: vacio } as Actividad;
  }

  return valor;
}

async function procesar(autor: AutorOrigen): Promise<Autor | null> {
  if (!autor.name && !autor.lastname) return null;
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
