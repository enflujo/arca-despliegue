import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Categoria6 = {
  id?: ID;
  nombre: string;
  descripcion?: string;
  obras?: Obra[];
  ancestro: ID;
  id_fuente: number;
};

export type Categoria6Fuente = {
  id: number;
  name: string;
  ancestry: string;
};

function limpieza(valor: string, contexto: CastingContext): string | boolean | string[] {
  const columna = contexto.column as keyof Categoria6Fuente;

  if (columna === 'name') {
    return valor.trim();
  }

  if (columna === 'ancestry') {
    if (valor.includes('/')) {
      const niveles = valor.split('/');
      if (niveles.length === 5) {
        return niveles;
      }

      return false;
    } else {
      return false;
    }
  }

  return valor;
}

async function procesar(fila: Categoria6Fuente, directus: Directus<ColeccionesArca>): Promise<Categoria6 | null> {
  if (!fila.ancestry) return null;

  const respuesta = { nombre: fila.name, id_fuente: fila.id } as Categoria6;

  const { data: categoria5 } = await directus
    .items('categorias5')
    .readByQuery({ filter: { id_fuente: { _eq: fila.ancestry[4] } } });

  if (categoria5?.length && categoria5[0]?.id) {
    respuesta.ancestro = categoria5[0].id;
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias6', directus, flujo, procesar);
};
