import 'dotenv/config';
import { Directus, ID } from '@directus/sdk';
import { ColeccionesArca } from './tipos';
import paisesEs from 'world_countries_lists/data/countries/es/world.json';
import { features as geos } from './datos/paises.json';
import slugify from 'slugify';
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

async function inicio() {
  const coleccion = directus.items('paises');
  const { data: paisesRegistrados } = await coleccion.readByQuery({ limit: -1 });

  paisesEs.forEach(async (pais) => {
    const paisRegistrado = paisesRegistrados?.find((paisRegistrado) => paisRegistrado.nombre === pais.name);

    if (!paisRegistrado) {
      const alpha3Normalizado = pais.alpha3.toLocaleLowerCase();
      const geojson = geos.find((f) => f.id?.toLocaleLowerCase() === alpha3Normalizado);

      if (geojson?.geometry) {
        await coleccion.createOne({
          nombre: pais.name,
          slug: slugify(pais.name, { lower: true }),
          geo: geojson.geometry,
        });
      } else {
        console.log('País', pais.name, 'no tiene geojson');
      }
    } else if (!paisRegistrado.geo) {
      const alpha3Normalizado = pais.alpha3.toLocaleLowerCase();
      const geojson = geos.find((f) => f.id?.toLocaleLowerCase() === alpha3Normalizado);

      if (geojson) {
        await coleccion.updateOne(paisRegistrado.id as ID, {
          geo: geojson.geometry,
        });
      } else {
        console.log('País', pais.name, 'no tiene geojson');
      }
    }
  });

  console.log('FIN');
  // entradaColeccion.data?.forEach(async (entradaColeccion) => {
  //   if (!entradaColeccion.geo) {
  //     console.log(entradaColeccion.nombre);
  //   }
  //   // await coleccion.updateOne(entradaColeccion.id as ID, {
  //   //   slug: slugify(entradaColeccion.nombre, { lower: true }),
  //   // });
  // });
}

inicio();
