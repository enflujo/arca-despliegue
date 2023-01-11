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

async function inicio() {
  const { data } = await directus.items('autores').readByQuery({ limit: -1 });
  console.log(data?.length);
}

inicio();
