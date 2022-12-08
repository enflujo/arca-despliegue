import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Categoria1 = {
  id?: ID;
  nombre: string;
  descripcion?: string;
  obras?: Obra[];
  id_fuente: number;
};

export type Categoria1Fuente = {
  id: number;
  name: string;
  ancestry: string;
};

function limpieza(valor: string, contexto: CastingContext): string | boolean {
  const columna = contexto.column as keyof Categoria1Fuente;

  if (columna === 'name') {
    return valor.trim();
  }

  if (columna === 'ancestry') {
    if (!valor) {
      return true;
    } else {
      return false;
    }
  }

  return valor;
}

async function procesar({ id, name, ancestry }: Categoria1Fuente): Promise<Categoria1 | null> {
  if (!ancestry) return null;
  return { nombre: name, id_fuente: id };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias1', directus, flujo, procesar);
};
