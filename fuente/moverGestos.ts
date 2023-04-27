import 'dotenv/config';
import { ColeccionesArca } from './tipos';
import { Directus, ID, ItemMetadata } from '@directus/sdk';

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
  const coleccion = directus.items('obras');
  const { meta } = await coleccion.readByQuery({ limit: 0, meta: 'total_count' });
  const { total_count } = meta as ItemMetadata;
  const bloque = 100;
  const numPaginas = Math.ceil((total_count as number) / bloque);
  const paginas = Array.from(Array(numPaginas).keys());

  for await (const pagina of paginas) {
    const { data } = await coleccion.readByQuery({
      limit: bloque,
      fields: ['id', 'gestos.gestos_id', 'registro'],
      page: pagina + 1,
    });

    if (data) {
      for await (const entrada of data) {
        if (entrada.gestos) {
          const [gesto1, gesto2, gesto3] = entrada.gestos;
          const datos = {
            gesto1: gesto1 && gesto1.gestos_id ? gesto1.gestos_id : undefined,
            gesto2: gesto2 && gesto2.gestos_id ? gesto2.gestos_id : undefined,
            gesto3: gesto3 && gesto3.gestos_id ? gesto3.gestos_id : undefined,
            gestos: [],
          };

          console.log('Actualizando registro', entrada.registro);
          await coleccion.updateOne(entrada.id as ID, datos);
        }
      }
    }
  }

  console.log('FIN');
}

inicio();
