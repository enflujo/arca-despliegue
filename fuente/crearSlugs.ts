import 'dotenv/config';
import { Directus, ID } from '@directus/sdk';
import { ColeccionesArca, Obra } from './tipos';
import slugify from 'slugify';
import { Autor } from './colecciones/autores';
import { Pais } from './colecciones/paises';
import { Ciudad } from './colecciones/ciudades';
import { Objeto } from './colecciones/objetos';
import { Escenario } from './colecciones/escenarios';
import { Tecnica } from './colecciones/tecnicas';
import { Donante } from './colecciones/donantes';
import { RelatoVisual } from './colecciones/relatosVisuales';
import { ComplejoGestual } from './colecciones/complejosGestuales';
import { TipoGestual } from './colecciones/tiposGestuales';
import { Gesto } from './colecciones/gestos';
import { Fisiognomica } from './colecciones/fisiognomicas';
import { FisiognomicaImagen } from './colecciones/fisiognomicasImagen';
import { Rostro } from './colecciones/rostros';
import { Ubicacion } from './colecciones/ubicaciones';
import { Personaje } from './colecciones/personajes';
import { CartelaFilacteria } from './colecciones/cartelasFilacterias';
import { Categoria1 } from './colecciones/categorias1';
import { Categoria2 } from './colecciones/categorias2';
import { Categoria3 } from './colecciones/categorias3';
import { Categoria4 } from './colecciones/categorias4';
import { Categoria5 } from './colecciones/categorias5';
import { Categoria6 } from './colecciones/categorias6';
import { logCambios, logResaltar } from './utilidades/ayudas';

type ColeccionesConSlugUnicos = {
  autores: Autor;
  paises: Pais;
  objetos: Objeto;
  escenarios: Escenario;
  tecnicas: Tecnica;
  donantes: Donante;
  relatos_visuales: RelatoVisual;
  complejos_gestuales: ComplejoGestual;
  tipos_gestuales: TipoGestual;
  gestos: Gesto;
  fisiognomicas: Fisiognomica;
  fisiognomicas_imagen: FisiognomicaImagen;
  rostros: Rostro;
  personajes: Personaje;
  cartelas_filacterias: CartelaFilacteria;
  categorias1: Categoria1;
  categorias2: Categoria2;
  categorias3: Categoria3;
  categorias4: Categoria4;
  categorias5: Categoria5;
  categorias6: Categoria6;
};

type ColeccionesConSlugRepetidos = {
  ubicaciones: Ubicacion;
  obras: Obra;
  ciudades: Ciudad;
};

// 'autores',

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

async function actualizarSlugsUnicos(tabla: keyof ColeccionesConSlugUnicos) {
  const coleccion = directus.items(tabla);
  const entradaColeccion = await coleccion.readByQuery({ limit: -1 });

  entradaColeccion.data?.forEach(async (entradaColeccion) => {
    await coleccion.updateOne(entradaColeccion.id as ID, {
      slug: slugify(entradaColeccion.nombre, { lower: true }),
    });
  });
}

async function inicio() {
  let conteoProcesados = 0;

  const coleccionesSlugsUnicos = [
    // 'obras',
    // 'autores',
    // 'personajes', //
    // 'fuentes',
    // 'ciudades',
    // 'paises', //
    // 'categorias1', //
    // 'categorias2', //
    // 'categorias3', //
    // 'categorias4', //
    // 'categorias5', //
    // 'categorias6', //
    // 'objetos', //
    // 'escenarios', //
    // 'tecnicas', //
    // 'donantes', //
    // 'relatos_visuales', //
    // 'complejos_gestuales', //
    // 'tipos_gestuales', //
    // 'gestos', //
    // 'fisiognomicas', //
    // 'fisiognomicas_imagen', //
    // 'cartelas_filacterias', //
    // 'rostros', //
  ];

  // for await (const coleccion of coleccionesSlugsUnicos) {
  //   await actualizarSlugsUnicos(coleccion as keyof ColeccionesConSlugUnicos);
  //   console.log(`Slugs de ${coleccion} actualizados`);
  //   conteoProcesados++;
  //   if (conteoProcesados === coleccionesSlugsUnicos.length) {
  //     console.log(logCambios('..:: FIN ::..'));
  //   }
  // }
}

inicio();
