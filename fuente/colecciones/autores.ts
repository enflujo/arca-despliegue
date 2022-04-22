import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { esNumero, logCambios, urlsAEnlacesHTML } from '../utilidades/ayudas';
import { Directus, TransportError } from '@directus/sdk';
import { ColeccionesArca } from '../aplicacion';

const vacio = { fecha: null, anotacion: null };

function procesarFechaActividad(fecha: string): { fecha: number | null; anotacion: string | null } {
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

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = createReadStream(`./datos/entrada/csv/Arca - Autores.csv`).pipe(
    parse({
      delimiter: ',',
      trim: true,
      columns: true,
      encoding: 'utf-8',
      skipRecordsWithEmptyValues: true,
      cast: (valor, contexto) => {
        if (!valor.length && contexto.column !== 'activity') return null;
        // Convertir URLS a enlaces de HTML
        if (contexto.column === 'reference' || contexto.column === 'biography') {
          valor = urlsAEnlacesHTML(valor);
        }

        if (contexto.column === 'activity') {
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

          return { desde: vacio, hasta: vacio };
        }

        return valor;
      },
    })
  );
  const limite = 100;
  let procesados = [];
  let contador = 0;
  for await (const autor of flujo) {
    procesados.push({
      nombre: autor.name,
      apellido: autor.lastname,
      desde: autor.activity.desde.fecha,
      desde_anotacion: autor.activity.desde.anotacion,
      hasta: autor.activity.hasta.fecha,
      hasta_anotacion: autor.activity.hasta.anotacion,
      biografia: autor.biography,
      referencia: autor.reference,
      status: 'published',
    });
    contador = contador + 1;

    if (contador >= limite) {
      try {
        await directus.items('autores').createMany(procesados);
        procesados = [];
        contador = 0;
      } catch (err) {
        const { errors } = err as TransportError;

        if (errors) {
          throw new Error(JSON.stringify(errors, null, 2));
        }
        console.error(err);
      }
    }
  }

  console.log(logCambios('autores creados'));
};
