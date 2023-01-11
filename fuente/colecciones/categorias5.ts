import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Categoria5 = {
  id?: ID;
  nombre: string;
  descripcion?: string;
  obras?: Obra[];
  ancestro: ID;
};

export type Categoria5Fuente = {
  id: number;
  name: string;
  ancestry: string;
};

function limpieza(valor: string, contexto: CastingContext): string | boolean | string[] {
  const columna = contexto.column as keyof Categoria5Fuente;

  if (columna === 'name') {
    return valor.trim();
  }

  if (columna === 'ancestry') {
    if (valor.includes('/')) {
      const niveles = valor.split('/');
      if (niveles.length === 4) {
        return niveles;
      }

      return false;
    } else {
      return false;
    }
  }

  return valor;
}

async function procesar(fila: Categoria5Fuente, directus: Directus<ColeccionesArca>): Promise<Categoria5 | null> {
  if (!fila.ancestry) return null;

  const respuesta = { nombre: fila.name, id: fila.id } as Categoria5;

  const { data: categoria4 } = await directus
    .items('categorias4')
    .readByQuery({ filter: { id: { _eq: fila.ancestry[3] } } });

  if (categoria4?.length && categoria4[0]?.id) {
    respuesta.ancestro = categoria4[0].id;
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias5', directus, flujo, procesar);
};
