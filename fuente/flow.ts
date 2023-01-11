import 'dotenv/config';
import { Directus } from '@directus/sdk';
import { ColeccionesArca } from './tipos';

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

async function agregar() {
  const coleccion = directus.items('obras');
  const { data: obras } = await coleccion.readByQuery({ limit: -1, fields: ['id', 'ubicacion'] });

  if (obras) {
    for await (const obra of obras) {
      if (obra.id && obra.ubicacion) {
        try {
          await coleccion.updateOne(obra.id, { ubicacion: obra.ubicacion });
          console.log(obra.id);
        } catch (error) {
          console.error(error);
          throw new Error();
        }
      }
    }

    console.log('..FIN..');
  }

  // .updateOne(107406, {
  //   ubicacion: 1323,
  // });
  // if (data) {
  //   for (const obra of data) {
  //     console.log(obra);
  //   }
  // }
}

async function borrar() {
  const borrar = await directus.items('obras').updateOne(107406, {
    ubicacion: null,
  });
  console.log(borrar);
}

async function inicio() {
  await agregar();
  // console.log('Borrando');
  // await borrar();
}

inicio();
