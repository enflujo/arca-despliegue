import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Categoria2 = {
  id?: ID;
  nombre: string;
  descripcion?: string;
  obras?: Obra[];
  ancestro: ID;
};

export type Categoria2Fuente = {
  id: number;
  name: string;
  ancestry: string;
};

function limpieza(valor: string, contexto: CastingContext): string | boolean {
  const columna = contexto.column as keyof Categoria2Fuente;

  if (columna === 'name') {
    return valor.trim();
  }

  if (columna === 'ancestry') {
    if (!valor.includes('/') && valor.length) {
      return valor;
    } else {
      return false;
    }
  }

  return valor;
}

async function procesar(fila: Categoria2Fuente, directus: Directus<ColeccionesArca>): Promise<Categoria2 | null> {
  if (!fila.ancestry) return null;

  const respuesta = { nombre: fila.name, id: fila.id } as Categoria2;

  const { data: categoria1 } = await directus
    .items('categorias1')
    .readByQuery({ filter: { id: { _eq: fila.ancestry } } });

  if (categoria1?.length && categoria1[0]?.id) {
    respuesta.ancestro = categoria1[0].id;
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias2', directus, flujo, procesar);
};
