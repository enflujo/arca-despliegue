import { Directus, ID } from '@directus/sdk';
import { CastingContext } from 'csv-parse/.';
import { ColeccionesArca, Obra } from '../tipos';
import { flujoCSV, procesarCSV } from '../utilidades/ayudas';

export type Gesto = {
  id?: ID;
  codigo: string | null;
  nombre: string;
  obras?: Obra[];
};

export type GestoFuente = {
  id: number;
  Nombre: string;
  'Nombre de registro': string;
};

function limpieza(valor: string, contexto: CastingContext): string | null {
  const columna = contexto.column as keyof GestoFuente;

  if (columna === 'Nombre') {
    return valor.trim();
  }

  if (columna === 'Nombre de registro') {
    const partes = valor.split(' ');
    const codigo = partes[0];

    if (codigo.length >= 3) {
      return codigo;
    } else if (codigo === '0') {
      return null;
    } else {
      return null;
    }
  }

  return valor;
}

function procesar(fila: GestoFuente): Gesto {
  return {
    id: fila.id,
    nombre: fila.Nombre,
    codigo: fila['Nombre de registro'],
  };
}

export default async (directus: Directus<ColeccionesArca>) => {
  const flujo = flujoCSV('Arca - Gesto_lista', limpieza);
  await procesarCSV('gestos', directus, flujo, procesar);
};
