import { Directus, SettingItem } from '@directus/sdk';
import { AxiosError } from 'axios';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import { ColeccionesArca } from '../aplicacion';
import { isEnum, logCambios, logResaltar, logSinCambios, mensaje } from '../utilidades/ayudas';
import { ArcaSettings, datosSettings } from '../utilidades/modeloSettings';

async function crearCarpetas(directus: Directus<ColeccionesArca>) {
  const { folders } = directus;
  const { data } = await folders.readByQuery({ limit: -1 });
  let nuevasCarpetas: string[] = [];

  if (data) {
    if (!data.length) {
      nuevasCarpetas = datosSettings.folders;
    } else {
      nuevasCarpetas = datosSettings.folders.filter((nombre) => !data.some((obj) => obj.name === nombre));
    }
  }

  if (nuevasCarpetas.length) {
    try {
      folders.createMany(
        nuevasCarpetas.map((nombre) => {
          return { name: nombre };
        })
      );

      console.log(logCambios(`Nuevas carpetas creadas: ${logResaltar(nuevasCarpetas)}`));
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        throw new Error(error.response.data.message);
      }
    }
  } else {
    console.log(logSinCambios(mensaje('Folders', 'No hay carpetas por crear')));
  }
}

async function subirImgsSistema(directus: Directus<ColeccionesArca>) {
  const { folders, files } = directus;
  const { data: carpetasActuales } = await folders.readByQuery({ limit: -1 });

  if (carpetasActuales) {
    const carpetaSistema = carpetasActuales.find((obj) => obj.name === 'Sistema');
    if (!carpetaSistema) {
      throw new Error('La carpeta "Sistema" no existe');
    }

    const { data: imgsActuales } = await files.readByQuery({
      filter: {
        folder: {
          _eq: carpetaSistema.id,
        },
      },
    });

    let nuevasImgs = [];

    if (!imgsActuales) {
      nuevasImgs = datosSettings.imgsSistema;
    } else {
      nuevasImgs = datosSettings.imgsSistema.filter((img) => !imgsActuales.some((obj) => obj.title === img.nombre));
    }

    if (nuevasImgs.length) {
      nuevasImgs.forEach(async (img) => {
        const form = new FormData();
        form.append('folder', carpetaSistema.id);
        form.append('title', img.nombre);
        form.append('file', createReadStream(img.ruta));

        try {
          await files.createOne(
            form,
            {},
            {
              requestOptions: {
                headers: { ...form.getHeaders() },
              },
            }
          );

          console.log(logCambios(`Nueva img: ${logResaltar(img.nombre)}`));
        } catch (err) {
          const error = err as AxiosError;
          if (error.response) {
            throw new Error(error.response.data.message);
          }
        }
      });
    }
  } else {
    console.log(logSinCambios(mensaje('Files', 'No hay imágenes de "Sistema" por subir.')));
  }
}

async function alimentarSettings(directus: Directus<ColeccionesArca>) {
  const { files, settings } = directus;
  const { data: iconoArca } = await files.readByQuery({
    filter: {
      title: { _eq: 'Icono Arca' },
    },
  });

  if (iconoArca) {
    datosSettings.settings.project_logo = iconoArca[0].id;
  }

  const valoresActuales = (await settings.read()) as SettingItem;

  if (valoresActuales) {
    const nuevosValores: ArcaSettings = {};

    for (let llave in valoresActuales) {
      if (datosSettings.settings.hasOwnProperty(llave) && datosSettings.settings[llave] !== valoresActuales[llave]) {
        nuevosValores[llave] = datosSettings.settings[llave];
      }
    }

    if (isEnum(nuevosValores)) {
      settings.update(nuevosValores);
      console.log(
        logCambios(
          mensaje('Settings', `Se actualizaron los campos: ${JSON.stringify(Object.keys(nuevosValores).join(','))}`)
        )
      );
    } else {
      console.log(logSinCambios(mensaje('Settings', `Sin actualizar`)));
    }
  }
}

export default async (directus: Directus<ColeccionesArca>) => {
  await crearCarpetas(directus);
  await subirImgsSistema(directus);
  await alimentarSettings(directus);
};
