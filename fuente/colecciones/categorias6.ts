import { Directus } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { CategoriaFuente, ColeccionesArca, SubCategoria } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

function limpieza(valor: string, contexto: CastingContext): string | boolean | string[] {
  const columna = contexto.column as keyof CategoriaFuente;

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

async function procesar(fila: CategoriaFuente, directus: Directus<ColeccionesArca>): Promise<SubCategoria | null> {
  if (!fila.ancestry) return null;

  const respuesta = { nombre: fila.name, id: fila.id } as SubCategoria;

  const { data: categoria5 } = await directus
    .items('categorias5')
    .readByQuery({ filter: { id: { _eq: fila.ancestry[4] } } });

  if (categoria5?.length && categoria5[0]?.id) {
    respuesta.ancestro = categoria5[0].id;
  }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Categoria_1_lista', limpieza);
  await procesarCSV('categorias6', directus, flujo, procesar);
};
