import { Directus, TransportError } from '@directus/sdk';
import { AxiosError } from 'axios';
import colores from 'cli-color';
import { CastingFunction, parse, Parser } from 'csv-parse';
import { createReadStream, writeFileSync } from 'fs';
import { ratio } from 'fuzzball';
import { ActividadObjeto, ColeccionesArca } from '../tipos';
/**
 * Revisa si un Objeto de JS contiene elementos
 * https://stackoverflow.com/a/69100805/3661186
 *
 * @param {Object} x El Objeto a revisar si tiene elementos.
 * @returns {Boolean} true o false
 */
export const isEnum = (x: Object): boolean => {
  for (let p in x) return !0;
  return !1;
};

export const logCambios = colores.black.bgCyan;
export const logSinCambios = colores.white.bgBlackBright;
export const logResaltar = colores.bold;
export const logError = colores.red.bold;

export const mensaje = (cabeza: string, mensaje: string) => {
  return `${logResaltar(cabeza)} | ${mensaje}`;
};

/**
 * Revisa si el valor de un texto contiene un número.
 *
 * @param valor {string} Texto a revisar
 * @returns {Boolean} true o false
 */
export const esNumero = (valor: string): boolean => !isNaN(parseInt(valor));

export const esNumero2 = (valor: number): boolean => !isNaN(valor);

export const urlsAEnlacesHTML = (valor: string): string => {
  const urls = valor.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=A-zÀ-ú]+)/g);

  if (urls) {
    urls.forEach((url) => {
      valor = valor.replace(url, `<a href="${url}" target="_blank">${url}</a>`);
    });
  }
  return valor;
};

export const flujoCSV = (nombreArchivo: string, limpieza: CastingFunction) => {
  return createReadStream(`./datos/entrada/csv/${nombreArchivo}.csv`).pipe(
    parse({
      delimiter: ',',
      trim: true,
      columns: true,
      skipRecordsWithEmptyValues: true,
      cast: limpieza,
    })
  );
};

export const guardar = async (nombreColeccion: string, directus: Directus<ColeccionesArca>, datos: any) => {
  try {
    await directus.items(nombreColeccion).createMany(datos);
  } catch (err) {
    const { errors } = err as TransportError;

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    console.error(nombreColeccion, err);
  }
};

export const procesarCSV = async (
  nombreColeccion: string,
  directus: Directus<ColeccionesArca>,
  flujo: Parser,
  procesarEntrada: any
) => {
  const limite = 100;
  let procesados = [];
  let contador = 0;
  let fila = 2;

  for await (const entrada of flujo) {
    const entradaProcesada = await procesarEntrada(entrada, directus, fila);
    if (entradaProcesada) {
      procesados.push(entradaProcesada);
      contador = contador + 1;
    }

    if (contador >= limite) {
      try {
        await guardar(nombreColeccion, directus, procesados);
      } catch (error) {
        console.error(nombreColeccion, procesados);
      }

      procesados = [];
      contador = 0;
    }

    fila++;
  }

  if (procesados.length) {
    await guardar(nombreColeccion, directus, procesados);
  }
};

/**
 * Convierte texto: sin mayúsculas, tildes o espacios alrededor;
 *
 * @param texto Texto a convertir
 * @returns Texto sin mayúsculas, tildes o espacios alrededor.
 */
export const normalizarTexto = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/**
 * Usar fuzz para obtener un porcentaje de similitud (útil cuando hay errores tipográficos o de digitación)
 * @param a Texto 1
 * @param b Texto 2
 * @returns {Boolean} true o false
 */
export const igualAprox = (a: string, b: string): boolean => ratio(a, b) > 85;

/**
 * Guardar datos localmente en archivo .json
 * @param {Object} json Datos que se quieren guardar en formato JSON.
 * @param {String} nombre Nombre del archivo, resulta en ${nombre}.json
 */
export const guardarJSON = (json: Object, nombre: string) => {
  writeFileSync(`./datos/${nombre}.json`, JSON.stringify(json, null, 2));
};

export const manejarErroresAxios = (error: AxiosError) => {
  if (error.response) {
    // console.log(error.response.data);
    console.log(error.response.statusText);
    console.log(error.response.status);
    // console.log(error.response.headers);
  } else if (error.request) {
    console.log(error.request);
  } else {
    console.log('Error', error.message);
  }
};

export const vacio = { fecha: null, anotacion: null } as ActividadObjeto;

export const procesarFechaActividad = (fecha: string): ActividadObjeto => {
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
};
