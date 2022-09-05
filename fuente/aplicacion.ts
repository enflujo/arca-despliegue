import 'dotenv/config';
import { Directus, TransportError } from '@directus/sdk';
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
import relatos_visuales from './colecciones/relatosVisuales';
import complejos_gestuales from './colecciones/complejosGestuales';

import obras from './colecciones/obras';

const directus = new Directus<ColeccionesArca>('http://localhost:8055', {
  auth: {
    staticToken: process.env.KEY,
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
  await crearColecciones(directus);
  await insertarDatosAColeccion('Autores', 'autores', autores); // LISTO
  await insertarDatosAColeccion('Países', 'paises', paises); // LISTO
  await insertarDatosAColeccion('Objetos', 'objetos', objetos); // LISTO
  await insertarDatosAColeccion('Escenarios', 'escenarios', escenarios); // LISTO
  await insertarDatosAColeccion('Técnicas', 'tecnicas', tecnicas); // LISTO
  await insertarDatosAColeccion('Fuentes', 'fuentes', fuentes); // LISTO
  await insertarDatosAColeccion('Donantes', 'donantes', donantes);
  await insertarDatosAColeccion('Relatos Visuales', 'relatos_visuales', relatos_visuales);
  await insertarDatosAColeccion('Complejos Gestuales', 'complejos_gestuales', complejos_gestuales);

  // await insertarDatosAColeccion('Ubicaciones', 'ubicaciones', ubicaciones);

  await insertarDatosAColeccion('Obras', 'obras', obras);
  // const datos: Obra[] = [{ titulo: 'prueba', autores: [{ autores_id: 1101 }] }];
  // try {
  //   await directus.items('obras').createMany(datos);
  // } catch (err) {
  //   const { errors } = err as TransportError;

  //   if (errors) {
  //     throw new Error(JSON.stringify(errors, null, 2));
  //   }
  // }
}

inicio();
