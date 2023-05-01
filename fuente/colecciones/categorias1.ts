import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { Categoria1, CategoriaFuente, ColeccionesArca } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string | boolean {
  const columna = contexto.column as keyof CategoriaFuente;

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

async function procesar({ id, name, ancestry }: CategoriaFuente): Promise<Categoria1 | null> {
  if (!ancestry) return null;
  return { id, nombre: name };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias1', directus, flujo, procesar);
};
