import { Directus, ID } from '@directus/sdk';
import { ColeccionesArca } from '../tipos';
import paisesEs from 'world_countries_lists/data/countries/es/countries.json';
import { features as geos } from '../datos/paises.json';
import { guardar } from '../utilidades/ayudas';

export type Pais = {
  id?: ID;
  nombre: string;
  slug?: string;
  geo: object;
};

async function procesar(directus: Directus<ColeccionesArca>, datos: Pais[]): Promise<void> {
  const limite = 10;
  let procesados: Pais[] = [];
  let contador = 0;

  for (let i = 0; i < datos.length; i++) {
    procesados.push(datos[i]);
    contador = contador + 1;

    if (contador >= limite) {
      await guardar('paises', directus, procesados);
      procesados = [];
      contador = 0;
    }
  }

  if (procesados.length) {
    await guardar('paises', directus, procesados);
  }
}

export default async (directus: Directus<ColeccionesArca>) => {
  const paises: Pais[] = [];

  paisesEs.forEach((paisEs) => {
    const alpha3Normalizado = paisEs.alpha3.toLocaleLowerCase();
    const geojson = geos.find((f) => f.id?.toLocaleLowerCase() === alpha3Normalizado);

    if (geojson) {
      paises.push({ nombre: paisEs.name, geo: geojson.geometry });
    } else {
      console.log(paisEs.id, paisEs.alpha3, ' - ', paisEs.name);
    }
  });

  paises.sort((a, b) => (a.nombre > b.nombre ? 1 : -1));

  await procesar(directus, paises);
};
