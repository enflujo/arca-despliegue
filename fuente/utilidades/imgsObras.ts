import fs from 'fs/promises';
import path from 'path';
import { guardarJSON } from './ayudas';

export type ListaImgs = {
  [key: string]: string;
};

async function listaImgs() {
  const rutaImgs = path.resolve(__dirname, '../../datos/entrada/imgs');
  const archivos = await fs.readdir(rutaImgs);
  const lista: ListaImgs = {};

  archivos.forEach((nombre: string) => {
    const { base: archivo, name: llave } = path.parse(nombre);
    lista[llave.trim()] = path.resolve(rutaImgs, archivo);
  });
  guardarJSON(lista, 'imgs');
  return lista;
}

export default listaImgs;
