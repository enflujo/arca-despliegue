import 'dotenv/config';
import { Directus } from '@directus/sdk';
import autores from './colecciones/autores';
import settings from './colecciones/_settings';
import { logCambios, logSinCambios, mensaje } from './utilidades/ayudas';
import { ColeccionesArca } from './tipos';
import ubicaciones from './colecciones/ubicaciones';
import paises from './colecciones/paises';
import objetos from './colecciones/objetos';
import escenarios from './colecciones/escenarios';
import tecnicas from './colecciones/tecnicas';
import fuentes from './colecciones/fuentes';
import donantes from './colecciones/donantes';
import relatos_visuales from './colecciones/relatos_visuales';
import complejos_gestuales from './colecciones/complejos_gestuales';

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
  await insertarDatosAColeccion('Autores', 'autores', autores);
  await insertarDatosAColeccion('Ubicaciones', 'ubicaciones', ubicaciones);
  await insertarDatosAColeccion('Países', 'paises', paises);
  await insertarDatosAColeccion('Objetos', 'objetos', objetos);
  await insertarDatosAColeccion('Escenarios', 'escenarios', escenarios);
  await insertarDatosAColeccion('Técnicas', 'tecnicas', tecnicas);
  await insertarDatosAColeccion('Fuentes', 'fuentes', fuentes);
  await insertarDatosAColeccion('Donantes', 'donantes', donantes);
  await insertarDatosAColeccion('Relatos Visuales', 'relatos_visuales', relatos_visuales);
  await insertarDatosAColeccion('Complejos Gestuales', 'complejos_gestuales', complejos_gestuales);
}

inicio();
