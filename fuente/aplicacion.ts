import 'dotenv/config';
import { Directus, FileType, ID } from '@directus/sdk';
import autores from './colecciones/autores';
import settings from './colecciones/settings';
import { logCambios, mensaje } from './utilidades/ayudas';

export type Autor = {
  id: ID;
  nombre: string;
  apellido: string;
  desde: number;
  desde_anotacion: string;
  hasta: number;
  hasta_anotacion: string;
  biografia: string;
  referencia: string;
};

export type Obra = {
  id: ID;
  titulo: string;
  imagen: FileType;
  autores: Autor[];
};

export type ColeccionesArca = {
  autores: Autor;
};

const directus = new Directus<ColeccionesArca>('http://localhost:8055', {
  auth: {
    staticToken: process.env.KEY,
  },
  // transport: {
  //   onUploadProgress: proceso
  // },
});

async function inicio() {
  const { meta: autoresMeta } = await directus.items('autores').readByQuery({ limit: 0, meta: 'total_count' });

  // await settings(directus);

  if (autoresMeta) {
    if (!autoresMeta.total_count) {
      console.log(logCambios(mensaje('Autores', 'Iniciando carga de datos.')));
      await autores(directus);
      console.log(logCambios(mensaje('Autores', 'Finalizó carga.')));
    }
  }
}

inicio();
