// https://geocode.xyz/[request]&auth=155444726755982595629x13131

import 'dotenv/config';
import axios from 'axios';
import { Directus, ID } from '@directus/sdk';
import { ColeccionesArca } from './tipos';
import { guardarJSON, logError, logResaltar, logSinCambios, normalizarTexto } from './utilidades/ayudas';
// https://geocode.xyz/Hauptstr.,+57632+Berzhausen?json=1&auth=your_api_key'
const LLAVE = process.env.GEO;
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

const directusServidor = new Directus<ColeccionesArca>('https://apiarca.uniandes.edu.co', {
  auth: {
    staticToken: process.env.KEY,
  },
  transport: {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  },
});

type ObjPais = { nombre: string };

function esperar(tiempo: number): Promise<void> {
  return new Promise((resolver) => {
    setTimeout(() => {
      resolver();
    }, tiempo);
  });
}

// Stratford está quedando en UK y es estados unidos
const errata: string[] = [];
const direcciones = [
  { ciudad: 'Belencito', pais: 'Colombia', lat: 5.77598, lon: -72.89118 },
  { ciudad: 'Bonza', pais: 'Colombia', lat: 5.816582, lon: -73.050881 },
  { ciudad: 'Tobasía', pais: 'Colombia', lat: 5.856544, lon: -72.944219 },
  { ciudad: 'Guane', pais: 'Colombia', lat: 6.678404, lon: -73.240063 },
];
type Ciudad = {
  pais?: ID | { nombre: string };
  geo?: string;
  nombre: string;
  id?: ID;
};

async function agregar(datosCiudad: Ciudad, ciudad: string, pais: string, lon: number, lat: number, datosAPI: any) {
  const ciudadCMS = normalizarTexto(datosCiudad.nombre);
  const ciudadAPI = normalizarTexto(ciudad);
  if (ciudadCMS === ciudadAPI) {
    const geo = JSON.stringify({
      coordinates: [lon, lat],
      type: 'Point',
    });

    await directus.items('ciudades').updateOne(datosCiudad.id as ID, { geo });

    console.log('Ciudad actualizada', ciudad, pais, '==', datosCiudad.nombre, (datosCiudad.pais as ObjPais).nombre);
  } else {
    errata.push(`Revisar: ${JSON.stringify(datosCiudad, null, 2)} - ${JSON.stringify(datosAPI, null, 2)}`);
    console.log(logError('revisar'), ciudad, datosAPI);
  }
}

async function buscarGeoXYZ(datosCiudad: Ciudad) {
  const nombreLugar = `${datosCiudad.nombre},${(datosCiudad.pais as ObjPais).nombre}`;
  const { data } = await axios.get(`https://geocode.xyz/${nombreLugar}?json=1&auth=${LLAVE}`);

  if (data.error) {
    const busquedaManual = direcciones.find(
      (obj) => obj.ciudad === datosCiudad.nombre && obj.pais === (datosCiudad.pais as ObjPais).nombre
    );

    if (busquedaManual) {
      await agregar(
        datosCiudad,
        busquedaManual.ciudad,
        busquedaManual.pais,
        busquedaManual.lon,
        busquedaManual.lat,
        busquedaManual
      );
    } else {
      console.log(logError('No se encontró en el API:', nombreLugar));
      errata.push(`No se encontró en el API: ${nombreLugar}`);
    }
  } else {
    if (data.standard && data.standard.city) {
      await agregar(datosCiudad, data.standard.city, data.standard.countryname, data.longt, data.latt, data);
    } else {
      errata.push(
        `Error en datos con ciudad: ${datosCiudad.nombre}, ${(datosCiudad.pais as ObjPais).nombre}: ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    }
  }
}

async function buscarGeo2(datosCiudad: Ciudad) {
  const { data } = await axios.get(
    `https://geocode.maps.co/search?city=${datosCiudad.nombre}&country=${(datosCiudad.pais as ObjPais).nombre}`
  );

  if (data && data.length) {
    const partes = data[0].display_name.split(',');

    await agregar(datosCiudad, partes[0], partes[partes.length - 1], data[0].lon, data[0].lat, data);
  } else {
    console.log(logError('No se encontró en el API:', datosCiudad.nombre));
    errata.push(`No se encontró en el API: ${datosCiudad.geo}, ${(datosCiudad.pais as ObjPais).nombre}`);
  }
}

async function buscar(datosCiudades: Ciudad[]) {
  let contador = 0;
  const limite = 2;

  for await (const ciudad of datosCiudades) {
    if (ciudad.nombre && ciudad.pais) {
      if (ciudad.geo) {
        console.log(logSinCambios(`${ciudad.nombre} ya tiene geo`));
      } else {
        // await buscarGeoXYZ(ciudad);
        await buscarGeo2(ciudad);

        contador++;

        if (contador === limite) {
          await esperar(1100);
          contador = 0;
        }
      }

      // console.log(`${ciudad.nombre},${(ciudad.pais as { nombre: string }).nombre}`);
    } else {
      errata.push(`no hay país para: ${ciudad}`);
      console.log('no hay país para', ciudad);
    }

    guardarJSON(errata, 'errata-geociudades');
  }
}

async function inicio() {
  const { data: datosCiudades } = await directus
    .items('ciudades')
    .readByQuery({ limit: -1, fields: ['id', 'nombre', 'pais.nombre', 'geo'] });

  if (!datosCiudades) return;

  // await buscar(datosCiudades);

  const conGeo = datosCiudades.filter((ciudad) => ciudad.geo);

  for await (const ciudad of conGeo) {
    if (ciudad.geo) {
      const elemento = await directusServidor.items('ciudades').readOne(ciudad.id as ID);

      if (!elemento) {
        console.error('NO existe en el servidor', ciudad);
      } else {
        if (!elemento.geo) {
          await directusServidor.items('ciudades').updateOne(elemento.id as ID, { geo: ciudad.geo });
          console.log('Ciudad actualizada', elemento.nombre);
        }
      }
    }
  }
  // console.log(sinGeo, sinGeo.length);

  console.log('FIN');
}

inicio();
