import 'dotenv/config';
import { Directus, ID, IItems } from '@directus/sdk';
import { ColeccionesArca, Obra } from './tipos';
import { flujoCSV, guardarJSON, logCambios, logSinCambios, mensaje } from './utilidades/ayudas';
import { CastingContext } from 'csv-parse/.';

export type SimbolosRegistro = {
  id: number;
  artwork_id: number;
  artwork_symbol_id: number;
  nombre: string;
};

export type DescriptoresRegistro = {
  id: number;
  artwork_id: number;
  description_id: number;
  nombre: string;
};

export type CaracteristicasRegistro = {
  id: number;
  artwork_id: number;
  engraving_id: number;
  nombre: string;
};

const url = process.env.AMBIENTE === 'produccion' ? 'https://apiarca.uniandes.edu.co' : 'http://localhost:8055';

const directus = new Directus<ColeccionesArca>(url, {
  auth: {
    staticToken: process.env.KEY,
  },
  transport: {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  },
});

function limpiezaSimbolos(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof SimbolosRegistro;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function limpiezaDescriptores(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof CaracteristicasRegistro;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

function limpiezaCaracteristicas(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof DescriptoresRegistro;

  if (columna === 'nombre') {
    return valor.trim();
  }

  return valor;
}

type TipoRelacion = 'simbolos.*' | 'descriptores.*' | 'caracteristicas.*';
type TipoCampo = 'simbolos' | 'descriptores' | 'caracteristicas';
type TipoUnion = 'simbolos_id' | 'descriptores_id' | 'caracteristicas_id';
interface Relacion {
  id: ID;
  obras_id: ID;
}

async function guardarDatos(
  coleccionObras: IItems<Obra>,
  campo: TipoCampo,
  obraId: ID,
  relacionesExistentes: ID[] = [],
  idRegistro: ID
) {
  let datos;

  switch (campo) {
    case 'simbolos':
      datos = { simbolos: [...relacionesExistentes, { simbolos_id: idRegistro as ID }] };
      break;
    case 'descriptores':
      datos = {
        descriptores: [...relacionesExistentes, { descriptores_id: idRegistro as ID }],
      };
      break;
    case 'caracteristicas':
      datos = {
        caracteristicas: [...relacionesExistentes, { caracteristicas_id: idRegistro as ID }],
      };
  }

  try {
    await coleccionObras.updateOne(obraId, datos);
  } catch (error) {
    console.log(error);
    throw new Error();
  }
}

async function agregar(
  csv: string,
  relacion: TipoRelacion,
  total: number,
  singular: string,
  campo: TipoCampo,
  union: TipoUnion,
  llaveRegistro: string,
  empezarEn: number = 0
) {
  const errata: string[] = [];
  const coleccionObras = directus.items('obras');
  const coleccion = directus.items(campo);

  const flujo = flujoCSV(csv, limpiezaSimbolos);
  console.log(logCambios(mensaje(campo, 'iniciando proceso de subir datos...')));
  let fila = 2;

  const { data: obras } = await coleccionObras.readByQuery({
    limit: -1,
    fields: ['id', 'registro'],
  });

  const { data: registros } = await coleccion.readByQuery({ limit: -1, fields: ['id', 'nombre'] });

  for await (const entrada of flujo) {
    console.log(`${fila}/${total}`);
    if (fila > empezarEn) {
      const obra = obras?.find((obj) => obj.registro == entrada.artwork_id);

      if (!obra) {
        errata.push(`${fila}: obra ${entrada.artwork_id} no existe.`);
      }

      const registro = registros?.find((obj) => obj.nombre === entrada.nombre);

      if (!registro) {
        errata.push(
          `${fila}: ${singular} ${entrada.nombre} (${entrada[llaveRegistro]}) no existe. Referencia a obra ${obra?.registro}.`
        );
      }

      if (obra && registro && obra.id && registro.id) {
        const { data: datosActuales } = await coleccionObras.readByQuery({
          filter: {
            registro: { _eq: obra.registro },
          },
          limit: 1,
          fields: ['id', 'registro', 'titulo', relacion],
        });

        if (datosActuales) {
          const relaciones = datosActuales[0][campo];

          if (!relaciones?.length) {
            await guardarDatos(coleccionObras, campo, obra.id, [], registro.id);
          } else {
            const relacionesExistentes = relaciones.map((obj: any) => obj.id) as ID[];
            let existeRelacion = false;

            for (let i = 0; i < relaciones.length; i++) {
              const obj = relaciones[i] as any;
              if (obj[union] === registro.id) {
                existeRelacion = true;
                break;
              }
            }

            if (!existeRelacion) {
              await guardarDatos(coleccionObras, campo, obra.id, relacionesExistentes, registro.id);
            } else {
              console.log(
                logSinCambios(
                  `${singular} "${registro.nombre}" ya existe en "${obra.registro} - ${datosActuales[0].titulo}"`
                )
              );
            }
          }
        } else {
          console.log('---- Problema volviendo a sacar datos ----');
          console.error(datosActuales, entrada);
          throw new Error();
        }
      }
    }

    fila++;
    guardarJSON(errata, `registros-${campo}`);
  }

  console.log(logCambios('FIN'));
}

async function inicio() {
  await agregar(
    'Arca - Simbolos_2_registros',
    'simbolos.*',
    99087,
    'símbolo',
    'simbolos',
    'simbolos_id',
    'artwork_symbol_id'
  );

  // await agregar(
  //   'Arca - Descriptores_registros_1',
  //   'descriptores.*',
  //   63621,
  //   'descriptor',
  //   'descriptores',
  //   'descriptores_id',
  //   'description_id'
  // );

  // await agregar(
  //   'Arca - Registros_caracteristicas_particulares_2',
  //   'caracteristicas.*',
  //   93986,
  //   'caracteristica',
  //   'caracteristicas',
  //   'caracteristicas_id',
  //   'engraving_id',
  //   1280
  // );
}

inicio();
