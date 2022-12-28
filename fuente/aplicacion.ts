import 'dotenv/config';
import { Directus } from '@directus/sdk';
import autores from './colecciones/autores';
import settings from './colecciones/_settings';
import crearColecciones from './colecciones/crearColecciones';
import { logCambios, logSinCambios, mensaje } from './utilidades/ayudas';
import { ColeccionesArca, Obra } from './tipos';
import ubicaciones from './colecciones/ubicaciones';
import paises from './colecciones/paises';

import objetos from './colecciones/objetos';
import escenarios from './colecciones/escenarios';
import tecnicas from './colecciones/tecnicas';
import fuentes from './colecciones/fuentes';
import donantes from './colecciones/donantes';
import relatosVisuales from './colecciones/relatosVisuales';
import complejosGestuales from './colecciones/complejosGestuales';

import obras from './colecciones/obras';
import gestos from './colecciones/gestos';
import fisiognomicas from './colecciones/fisiognomicas';
import fisiognomicasImagen from './colecciones/fisiognomicasImagen';
import rostros from './colecciones/rostros';
import ciudades from './colecciones/ciudades';
import personajes from './colecciones/personajes';
import tiposGestuales from './colecciones/tiposGestuales';
import cartelasFilacterias from './colecciones/cartelasFilacterias';
import categorias1 from './colecciones/categorias1';
import categorias2 from './colecciones/categorias2';
import categorias3 from './colecciones/categorias3';
import categorias4 from './colecciones/categorias4';
import categorias5 from './colecciones/categorias5';
import categorias6 from './colecciones/categorias6';
import simbolos from './colecciones/simbolos';
import descriptores from './colecciones/descriptores';
import caracteristicas from './colecciones/caracteristicas';

const url = process.env.AMBIENTE === 'produccion' ? 'https://apiarca.uniandes.edu.co' : 'http://localhost:8055';

const directus = new Directus<ColeccionesArca>(url, {
  auth: {
    staticToken: process.env.KEY,
  },
  transport: {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  },
});

async function insertarDatosAColeccion(nombre: string, coleccion: string, procesador: any) {
  const { meta } = await directus.items(coleccion).readByQuery({ limit: 0, meta: 'total_count' });

  if (meta) {
    if (!meta.total_count) {
      console.log(logCambios(mensaje(nombre, 'Iniciando carga de datos.')));
      await procesador(directus);
      console.log(logCambios(mensaje(nombre, 'Finalizó carga.')));
    } else {
      console.log(logSinCambios(mensaje(nombre, 'Sin cambios')));
    }
  }
}

async function inicio() {
  await settings(directus);

  // await crearColecciones(directus);
  await insertarDatosAColeccion('Personajes', 'personajes', personajes); // LISTO Cols: B-G
  await insertarDatosAColeccion('Autores', 'autores', autores); // LISTO Cols: H-I
  await insertarDatosAColeccion('Escenarios', 'escenarios', escenarios); // LISTO Cols: J-K
  await insertarDatosAColeccion('Técnicas', 'tecnicas', tecnicas); // LISTO Cols: L-M
  await insertarDatosAColeccion('Fuentes', 'fuentes', fuentes); // LISTO Cols: N-O
  await insertarDatosAColeccion('Donantes', 'donantes', donantes); // LISTO Cols: P-Q

  await insertarDatosAColeccion('Objetos', 'objetos', objetos); // LISTO Cols: AW-AX

  await insertarDatosAColeccion('Relatos Visuales', 'relatos_visuales', relatosVisuales); // LISTO cols: AS-AT
  await insertarDatosAColeccion('Complejos Gestuales', 'complejos_gestuales', complejosGestuales); // LISTO Cols: AY-AZ
  await insertarDatosAColeccion('Gestos', 'gestos', gestos); // LISTO Cols: BA-BF
  await insertarDatosAColeccion('Fisiognómicas', 'fisiognomicas', fisiognomicas); // LISTO Cols: BG-BH
  await insertarDatosAColeccion('Fisiognómicas Imagen', 'fisiognomicas_imagen', fisiognomicasImagen); // LISTO Cols: BI-BJ
  await insertarDatosAColeccion('Rostros', 'rostros', rostros); // LISTO Cols: BM-BN
  await insertarDatosAColeccion('Países', 'paises', paises); // LISTO Cols: V-Y
  await insertarDatosAColeccion('Ciudades', 'ciudades', ciudades); // LISTO Cols: R-U
  await insertarDatosAColeccion('Ubicaciones', 'ubicaciones', ubicaciones); // LISTO
  await insertarDatosAColeccion('Tipos Gestuales', 'tipos_gestuales', tiposGestuales); //
  await insertarDatosAColeccion('Cartelas Filacterias', 'cartelas_filacterias', cartelasFilacterias); //
  await insertarDatosAColeccion('Categorías 1', 'categorias1', categorias1); //
  await insertarDatosAColeccion('Categorías 2', 'categorias2', categorias2); //
  await insertarDatosAColeccion('Categorías 3', 'categorias3', categorias3); //
  await insertarDatosAColeccion('Categorías 4', 'categorias4', categorias4); //
  await insertarDatosAColeccion('Categorías 5', 'categorias5', categorias5); //
  await insertarDatosAColeccion('Categorías 6', 'categorias6', categorias6); //
  await insertarDatosAColeccion('Símbolos', 'simbolos', simbolos);
  await insertarDatosAColeccion('Descriptores', 'descriptores', descriptores);
  await insertarDatosAColeccion('Características', 'caracteristicas', caracteristicas);
  await insertarDatosAColeccion('Obras', 'obras', obras);
}

inicio();
