import 'dotenv/config';
import { Directus, ID } from '@directus/sdk';
import { ColeccionesArca, ObraFuente } from './tipos';
import { CastingContext, parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { ListaImgs } from './utilidades/imgsObras';
import listaImgs from './utilidades/imgsObras';
import path from 'path';

let imagenes: ListaImgs;

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

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ObraFuente;

  if (columna === 'Id') {
    let llaveImg = valor.padStart(4, '0');
    let ruta = imagenes[llaveImg];

    if (!ruta) {
      llaveImg = valor.padStart(5, '0');
      ruta = imagenes[llaveImg];

      if (!ruta) {
        console.error(`La imagen con ID ${valor} no existe.`);
      }
    }
    const datosImg = path.parse(ruta);

    return `${datosImg.base}:${valor.trim()}`;
  }

  if (columna === 'título') {
    return valor.trim();
  }

  return valor;
}

async function procesarEntrada(fila: ObraFuente, directus: Directus<ColeccionesArca>) {
  const [nombreArchivo, id] = String(fila.Id).split(':');

  const coleccion = directus.items('obras');
  const { data } = await coleccion.readByQuery({
    filter: {
      imagen: {
        filename_download: { _eq: nombreArchivo },
      },
    },
    limit: -1,
  });

  if (data && data?.length === 1) {
    const entrada = data[0];
    // if (entrada.titulo === fila.título) {
    try {
      await coleccion.updateOne(entrada.id as ID, {
        registro: +id,
      });
    } catch (error) {
      console.log(fila);
      throw new Error(JSON.stringify(error, null, 2));
    }
    // } else {
    //   console.log('no coincide el nombre', fila.título, entrada.titulo);
    //   throw new Error();
    // }
  } else {
    console.log('hay mas de 2', data);
    throw new Error();
  }
}

async function inicio() {
  imagenes = await listaImgs();

  const flujo = createReadStream(`./datos/entrada/csv/Arca - Registro general_dic_5_2022.csv`).pipe(
    parse({
      delimiter: ',',
      trim: true,
      columns: true,
      skipRecordsWithEmptyValues: true,
      cast: limpieza,
    })
  );

  for await (const entrada of flujo) {
    await procesarEntrada(entrada, directus);
  }

  console.log('FIN');
}

inicio();
