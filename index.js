import 'dotenv/config';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { isEnum, logCambios, logSinCambios, logResaltar } from './utilidades/ayudas.js';
import modelo from './esquemas/modeloSettings.js';

// Crea instancia de Axios con parámetros que suma a todas las peticiones.
const api = axios.create({
  baseURL: 'http://localhost:8055',
  headers: {
    Authorization: `Bearer ${process.env.KEY}`,
  },
});

async function subirImgsSistema() {
  const { data: carpetasActuales } = await api.get('/folders?limit=-1');
  const carpetaSistema = carpetasActuales.data.find((obj) => obj.name === 'Sistema');

  if (!carpetaSistema) {
    throw new Error('La carpeta "Sistema" no existe');
  }

  const { data: imgsActuales } = await api.get(`/files?filter[folder][_eq]=${carpetaSistema.id}`);
  let nuevasImgs = [];

  if (!imgsActuales.data.length) {
    nuevasImgs = modelo.imgsSistema;
  } else {
    nuevasImgs = modelo.imgsSistema.filter((img) => !imgsActuales.data.some((obj) => obj.title === img.nombre));
  }

  if (nuevasImgs.length) {
    nuevasImgs.forEach(async (img) => {
      const form = new FormData();

      form.append('folder', carpetaSistema.id);
      form.append('title', img.nombre);
      form.append('file', createReadStream(img.ruta));

      try {
        await api.post('/files', form, {
          headers: form.getHeaders(),
        });

        console.log(logCambios(`Nuevas img: ${logResaltar(img.nombre)}`));
      } catch (err) {
        throw new Error(err);
      }
    });
  } else {
    console.log(logSinCambios('No hay imágenes de "Sistema" por subir.'));
  }
}

async function crearCarpetas() {
  const { data: carpetasActuales } = await api.get('/folders?limit=-1');
  let nuevasCarpetas = [];

  if (!carpetasActuales.data.length) {
    nuevasCarpetas = modelo.folders;
  } else {
    nuevasCarpetas = modelo.folders.filter((nombre) => !carpetasActuales.data.some((obj) => obj.name === nombre));
  }

  if (nuevasCarpetas.length) {
    try {
      await api.post(
        '/folders',
        nuevasCarpetas.map((nombre) => {
          return { name: nombre };
        })
      );

      console.log(logCambios(`Nuevas carpetas creadas: ${logResaltar(nuevasCarpetas)}`));
    } catch (err) {
      throw new Error(err);
    }
  } else {
    console.log(logSinCambios('No hay carpetas por crear.'));
  }
}

async function alimentarSettings() {
  const { data: valoresActuales } = await api.get('/settings');
  const { data: icono } = await api.get(`/files?filter[title][_eq]=Icono Arca`);
  modelo.settings.project_logo = icono.data[0].id;
  // public_foreground: null,
  // public_background: null,

  const nuevosValores = {};

  for (let llave in valoresActuales.data) {
    if (modelo.settings.hasOwnProperty(llave) && modelo.settings[llave] !== valoresActuales.data[llave]) {
      nuevosValores[llave] = modelo.settings[llave];
    }
  }

  if (isEnum(nuevosValores)) {
    api.patch('/settings', nuevosValores);
    console.log(logCambios(`Actualización de: ${logResaltar('Settings')}`));
  } else {
    console.log(logSinCambios(`Nada por actualizar en: ${logResaltar('Settings')}`));
  }
}

async function alimentar() {
  await crearCarpetas();
  await subirImgsSistema();
  await alimentarSettings();
  console.log('FIN');
}

alimentar();
