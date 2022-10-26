import { Directus, FolderType, OneItem } from '@directus/sdk';
import FormData from 'form-data';
import { CastingContext } from 'csv-parse/.';
import { createReadStream } from 'fs';
import { ColeccionesArca, Obra, ObraFuente } from '../tipos';
import { esNumero, flujoCSV, logCambios, logResaltar, manejarErroresAxios, procesarCSV } from '../utilidades/ayudas';
import listaImgs from '../utilidades/imgsObras';
import imgsObras, { ListaImgs } from '../utilidades/imgsObras';
import { AxiosError } from 'axios';
let carpetaObras: OneItem<FolderType>;
let imagenes: ListaImgs;

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ObraFuente;

  if (columna === 'título') valor.trim();

  return valor;
}

async function cargarImg(directus: Directus<ColeccionesArca>, id: string, titulo: string) {
  if (!carpetaObras) return;
  const ruta = imagenes[id];
  if (!ruta) {
    throw new Error(`La imagen con ID ${id} no existe.`);
  }
  const form = new FormData();
  form.append('folder', carpetaObras.id);
  form.append('title', titulo);
  form.append('file', createReadStream(ruta));

  try {
    return await directus.files.createOne(
      form,
      {},
      {
        requestOptions: {
          headers: { ...form.getHeaders() },
        },
      }
    );
  } catch (err) {
    const error = err as AxiosError;
    manejarErroresAxios(error);
    return null;
  }
}

async function procesar(fila: ObraFuente, directus: Directus<ColeccionesArca>): Promise<Obra | null> {
  const respuesta: Obra = {
    titulo: fila.título,
    fecha_periodo: false,
  };

  /**
   * FIJOS
   */
  if (fila.Sintesis) {
    respuesta.sintesis = fila.Sintesis.trim();
  }

  if (fila.fechas_actividad) {
    const fechas = fila.fechas_actividad.split('-');

    if (fechas.length === 1 && esNumero(fechas[0])) {
      respuesta.fecha_inicial = +fechas;
    } else {
      const [fechaInicial, fechaFinal] = fechas;

      respuesta.fecha_periodo = true;

      if (esNumero(fechaInicial)) {
        respuesta.fecha_inicial = +fechaInicial;
      } else {
        throw new Error(`La fechaInicial ${fechaInicial} no es un número.`);
      }

      if (esNumero(fechaFinal)) {
        respuesta.fecha_final = +fechaFinal;
      } else {
        throw new Error(`La fechaFinal ${fechaFinal} no es un número.`);
      }
    }
  }

  /**
   * M2O
   */
  const { data: fuenteImagen } = await directus
    .items('fuentes')
    .readByQuery({ filter: { descripcion: { _eq: fila.Fuente_imagen } } });

  if (fuenteImagen?.length) {
    respuesta.fuente = fuenteImagen[0]?.id;
  }

  const { data: complejoGestual } = await directus
    .items('complejos_gestuales')
    .readByQuery({ filter: { nombre: { _eq: fila.Complejo_gestual_lista } } });

  if (complejoGestual?.length && complejoGestual[0]?.id) {
    respuesta.complejo_gestual = complejoGestual[0].id;
  }

  const { data: ubicacion } = await directus
    .items('ubicaciones')
    .readByQuery({ filter: { id_fuente: { _eq: fila.ubicacion_id } } });

  if (ubicacion?.length && ubicacion[0]?.id) {
    respuesta.ubicacion = ubicacion[0].id;
  }

  const { data: relatoVisual } = await directus
    .items('relatos_visuales')
    .readByQuery({ filter: { nombre: { _eq: fila.Relato_visual_lista } } });

  if (relatoVisual?.length && relatoVisual[0]?.id) {
    respuesta.relato_visual = relatoVisual[0].id;
  }

  const { data: donante } = await directus.items('donantes').readByQuery({ filter: { nombre: { _eq: fila.Donante } } });

  if (donante?.length && donante[0]?.id) {
    respuesta.donante = donante[0].id;
  }

  const { data: fisiognomica } = await directus
    .items('fisiognomicas')
    .readByQuery({ filter: { nombre: { _eq: fila.Fisiognómica_lista } } });

  if (fisiognomica?.length && fisiognomica[0]?.id) {
    respuesta.fisiognomica = fisiognomica[0].id;
  }

  const { data: fisiognomicaImagen } = await directus
    .items('fisiognomicas_imagen')
    .readByQuery({ filter: { nombre: { _eq: fila.Fisiognomica_imagen_lista } } });

  if (fisiognomicaImagen?.length && fisiognomicaImagen[0]?.id) {
    respuesta.fisiognomica_imagen = fisiognomicaImagen[0].id;
  }

  const { data: rostro } = await directus
    .items('rostros')
    .readByQuery({ filter: { nombre: { _eq: fila.Rostro_lista } } });

  if (rostro?.length && rostro[0]?.id) {
    respuesta.rostro = rostro[0].id;
  }

  /**
   * M2M
   */
  const { data: autor } = await directus
    .items('autores')
    .readByQuery({ filter: { id_fuente: { _eq: fila.autores_id } } });

  if (autor?.length && autor[0]?.id) {
    respuesta.autores = [{ autores_id: autor[0].id }];
  }

  const { data: tecnica } = await directus.items('tecnicas').readByQuery({ filter: { nombre: { _eq: fila.Tecnica } } });

  if (tecnica?.length && tecnica[0]?.id) {
    respuesta.tecnicas = [{ tecnicas_id: tecnica[0].id }];
  }

  const { data: escenario } = await directus
    .items('escenarios')
    .readByQuery({ filter: { nombre: { _eq: fila.Escenario } } });

  if (escenario?.length && escenario[0]?.id) {
    respuesta.escenarios = [{ escenarios_id: escenario[0].id }];
  }

  const { data: objeto } = await directus
    .items('objetos')
    .readByQuery({ filter: { nombre: { _eq: fila.Objetos_gestos_lista } } });

  if (objeto?.length && objeto[0]?.id) {
    respuesta.objetos = [{ objetos_id: objeto[0].id }];
  }

  const { data: gesto1 } = await directus.items('gestos').readByQuery({ filter: { nombre: { _eq: fila.Gesto_1 } } });
  const { data: gesto2 } = await directus.items('gestos').readByQuery({ filter: { nombre: { _eq: fila.Gesto_2 } } });
  const { data: gesto3 } = await directus.items('gestos').readByQuery({ filter: { nombre: { _eq: fila.Gesto_3 } } });
  const gestos = [];

  if (gesto1?.length && gesto1[0]?.id) {
    gestos.push({ gestos_id: gesto1[0].id });
  }
  if (gesto2?.length && gesto2[0]?.id) {
    gestos.push({ gestos_id: gesto2[0].id });
  }
  if (gesto3?.length && gesto3[0]?.id) {
    gestos.push({ gestos_id: gesto3[0].id });
  }

  if (gestos.length) {
    respuesta.gestos = gestos;
  }

  // const img = await cargarImg(directus, String(fila.Id).padStart(4, '0'), fila.título);

  // if (img) {
  //   respuesta.imagen = img.id;
  // }

  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const { data: carpetasActuales } = await directus.folders.readByQuery({ limit: -1 });
  carpetaObras = carpetasActuales?.find((obj) => obj?.name === 'Obras');
  imagenes = await listaImgs();

  if (!carpetaObras) {
    throw new Error('La carpeta "Obras" no existe');
  }

  const flujo = flujoCSV('Arca - Registro general', limpieza);
  await procesarCSV('obras', directus, flujo, procesar);
};
