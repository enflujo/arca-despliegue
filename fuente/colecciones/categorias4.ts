import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Categoria4 = {
  id?: ID;
  nombre: string;
  descripcion?: string;
  obras?: Obra[];
  ancestro: ID;
};

export type Categoria4Fuente = {
  id: number;
  name: string;
  ancestry: string;
};

function limpieza(valor: string, contexto: CastingContext): string | boolean | string[] {
  const columna = contexto.column as keyof Categoria4Fuente;

  if (columna === 'name') {
    return valor.trim();
  }

  if (columna === 'ancestry') {
    if (valor.includes('/')) {
      const niveles = valor.split('/');
      if (niveles.length === 3) {
        return niveles;
      }

      return false;
    } else {
      return false;
    }
  }

  return valor;
}

async function procesar(fila: Categoria4Fuente, directus: Directus<ColeccionesArca>): Promise<Categoria4 | null> {
  if (!fila.ancestry) return null;

  const respuesta = { nombre: fila.name, id: fila.id } as Categoria4;

  const { data: categoria3 } = await directus
    .items('categorias3')
    .readByQuery({ filter: { id: { _eq: fila.ancestry[2] } } });

  if (categoria3?.length && categoria3[0]?.id) {
    respuesta.ancestro = categoria3[0].id;
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias4', directus, flujo, procesar);
};
