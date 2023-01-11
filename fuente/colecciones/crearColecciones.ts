import { Directus, CollectionItem, FieldItem, RelationItem } from '@directus/sdk';
import { AxiosError } from 'axios';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import { ColeccionesArca } from '../tipos';
import { logCambios, logSinCambios, manejarErroresAxios, mensaje } from '../utilidades/ayudas';

const esquemas = readFileSync('./datos/entrada/arca.yml', 'utf-8');
const {
  collections: esquemasColecciones,
  fields: campos,
  relations: relaciones,
} = yaml.load(esquemas) as Record<string, any>;

async function crearRelaciones(directus: Directus<ColeccionesArca>, relaciones: RelationItem[]) {
  relaciones.forEach(async (relacion: RelationItem) => {
    await directus.relations.createOne(relacion);
  });

  console.log(logCambios(mensaje('Colecciones', `Relaciones creadas entre colecciones.`)));
}

async function crearColecciones(directus: Directus<ColeccionesArca>, colecciones: CollectionItem[]) {
  const coleccionesNuevas = await directus.collections.createMany(colecciones);

  coleccionesNuevas.data?.forEach((obj) => {
    console.log(logCambios(mensaje('Colecciones', `Se creo la colección: ${obj.collection}`)));
  });

  campos.forEach(async (campo: FieldItem) => {
    await directus.fields.updateOne(campo.collection, campo.field, campo);
  });

  console.log(logCambios(mensaje('Colecciones', `Campos creados en colecciones.`)));
}

export default async (directus: Directus<ColeccionesArca>) => {
  try {
    const coleccionesDirectus = await directus.collections.readAll();
    const coleccionesCreadas = coleccionesDirectus.data
      ?.filter((obj) => !obj.collection.includes('directus'))
      .map((esquema) => esquema.collection);
    if (coleccionesCreadas?.length) {
      const coleccionesNuevas = esquemasColecciones.filter(
        (esquema: CollectionItem) => !coleccionesCreadas.includes(esquema.collection)
      );
      if (coleccionesNuevas.length) {
        await crearColecciones(directus, coleccionesNuevas);
      } else {
        console.log(logSinCambios(mensaje('Colecciones', `Sin actualizar`)));
      }
    } else {
      await crearColecciones(directus, esquemasColecciones);
    }

    const relacionesDirectus = (await directus.relations.readAll()) as RelationItem[];
    const relacionesCreadas = relacionesDirectus.filter((obj) => !obj.collection.includes('directus'));

    if (relacionesCreadas.length) {
      const relacionesNuevas = relaciones.filter((relacion: RelationItem) => {
        const existeRelacion = relacionesCreadas.find((creada: RelationItem) => {
          return relacion.collection === creada.collection && relacion.field === creada.field;
        });
        return !existeRelacion;
      });

      if (relacionesNuevas.length) {
        await crearRelaciones(directus, relacionesNuevas);
      } else {
        console.log(
          logSinCambios(
            mensaje(
              'Relaciones',
              `Todas las relaciones ya están creadas ${relacionesCreadas.length} / ${relaciones.length}`
            )
          )
        );
      }
    } else {
      await crearRelaciones(directus, relaciones);
    }
  } catch (err: any) {
    if (err.errors) {
      if (err.errors.length) {
        throw new Error(JSON.stringify(err.errors[0], null, 2));
      }
    }
    const error = err as AxiosError;
    manejarErroresAxios(error);
  }
};
