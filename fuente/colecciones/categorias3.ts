import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Categoria3 = {
  id?: ID;
  nombre: string;
  descripcion?: string;
  obras?: Obra[];
  ancestro: ID;
};

export type Categoria3Fuente = {
  id: number;
  name: string;
  ancestry: string;
};

function limpieza(valor: string, contexto: CastingContext): string | boolean | string[] {
  const columna = contexto.column as keyof Categoria3Fuente;

  if (columna === 'name') {
    return valor.trim();
  }

  if (columna === 'ancestry') {
    if (valor.includes('/')) {
      const niveles = valor.split('/');
      if (niveles.length === 2) {
        return niveles;
      }

      return false;
    } else {
      return false;
    }
  }

  return valor;
}

async function procesar(fila: Categoria3Fuente, directus: Directus<ColeccionesArca>): Promise<Categoria3 | null> {
  if (!fila.ancestry) return null;

  const respuesta = { nombre: fila.name, id: fila.id } as Categoria3;

  const { data: categoria2 } = await directus
    .items('categorias2')
    .readByQuery({ filter: { id: { _eq: fila.ancestry[1] } } });

  if (categoria2?.length && categoria2[0]?.id) {
    respuesta.ancestro = categoria2[0].id;
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias3', directus, flujo, procesar);
};
