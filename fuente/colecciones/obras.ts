import { Directus, FolderType, OneItem } from '@directus/sdk';
import FormData from 'form-data';
import { CastingContext } from 'csv-parse/.';
import { createReadStream } from 'fs';
import { ColeccionesArca, Obra, ObraFuente } from '../tipos';
import {
  esNumero,
  esNumero2,
  flujoCSV,
  guardarJSON,
  manejarErroresAxios,
  procesarCSV,
  urlsAEnlacesHTML,
} from '../utilidades/ayudas';
import listaImgs from '../utilidades/imgsObras';
import { ListaImgs } from '../utilidades/imgsObras';
import { AxiosError } from 'axios';
import errata from '../utilidades/errata';
let carpetaObras: OneItem<FolderType>;
let imagenes: ListaImgs;

function limpieza(valor: string, contexto: CastingContext): string {
  const columna = contexto.column as keyof ObraFuente;

  if (columna === 'título') valor.trim();

  return valor;
}

async function cargarImg(directus: Directus<ColeccionesArca>, id: number, titulo: string) {
  if (!carpetaObras) return;
  let llaveImg = String(id).padStart(4, '0');
  let ruta = imagenes[llaveImg];

  if (!ruta) {
    llaveImg = String(id).padStart(5, '0');
    ruta = imagenes[llaveImg];

    if (!ruta) {
      // throw new Error(`La imagen con ID ${id} no existe.`);
      console.error(`La imagen con ID ${id} no existe.`);
    }
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
    console.log('ERRORRRRRRRRRR', id, titulo);
    const error = err as AxiosError;
    manejarErroresAxios(error);
    return null;
  }
}

async function procesar(fila: ObraFuente, directus: Directus<ColeccionesArca>, numFila: number): Promise<Obra | null> {
  errata[numFila] = [];
  /**
   * FIJOS
   */
  const respuesta: Obra = {
    titulo: fila.título,
    fecha_periodo: false,
  };

  if (fila.Sintesis) {
    respuesta.sintesis = urlsAEnlacesHTML(fila.Sintesis);
  } else {
    //errata.push(`No hay "Sintesis" en: ${JSON.stringify(fila, null, 2)}`);
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
  } else {
    errata[numFila].push(`No hay "fechas_actividad"`);
  }

  if (fila.Anotacion_Comentario_bibliográfico) {
    respuesta.comentario_bibliografico = urlsAEnlacesHTML(fila.Anotacion_Comentario_bibliográfico);
  } else {
    //errata.push(`No hay "Anotacion_Comentario_bibliográfico" en: ${JSON.stringify(fila, null, 2)}`);
  }

  if (fila.Iconotexto) {
    respuesta.iconotexto = fila.Iconotexto.trim();
  } else {
    // errata.push(`No hay "Iconotexto" en: ${JSON.stringify(fila, null, 2)}`);
  }

  /**
   * M2O
   */
  if (fila.fuente_imagen_1_id) {
    const { data: fuenteImagen } = await directus
      .items('fuentes')
      .readByQuery({ filter: { id: { _eq: fila.fuente_imagen_1_id } } });

    if (fuenteImagen?.length) {
      respuesta.fuente = fuenteImagen[0]?.id;
    } else {
      errata[numFila].push(`${fila.fuente_imagen_1_id} no existe en colección "fuentes"`);
    }
  } else {
    errata[numFila].push(`No hay "fuente_imagen_1_id"`);
  }

  if (fila.Complejo_gestual_id) {
    const { data: complejoGestual } = await directus
      .items('complejos_gestuales')
      .readByQuery({ filter: { id: { _eq: fila.Complejo_gestual_id } } });

    if (complejoGestual?.length && complejoGestual[0]?.id) {
      respuesta.complejo_gestual = complejoGestual[0].id;
    } else {
      errata[numFila].push(`${fila.Complejo_gestual_id} no existe en colección "complejos_gestuales"`);
    }
  } else {
    errata[numFila].push(`No hay "Complejo_gestual_lista"`);
  }

  if (fila.ubicacion_id) {
    const { data: ubicacion } = await directus
      .items('ubicaciones')
      .readByQuery({ filter: { id: { _eq: fila.ubicacion_id } } });

    if (ubicacion?.length && ubicacion[0]?.id) {
      respuesta.ubicacion = ubicacion[0].id;
    } else {
      errata[numFila].push(`${fila.ubicacion_id} no existe en colección "ubicaciones"`);
    }
  } else {
    errata[numFila].push(`No hay "ubicacion_id"`);
  }

  if (fila.Relato_visual_id) {
    const { data: relatoVisual } = await directus
      .items('relatos_visuales')
      .readByQuery({ filter: { id: { _eq: fila.Relato_visual_id } } });

    if (relatoVisual?.length && relatoVisual[0]?.id) {
      respuesta.relato_visual = relatoVisual[0].id;
    } else {
      errata[numFila].push(`${fila.Relato_visual_id} no existe en colección "relatos_visuales"`);
    }
  } else {
    errata[numFila].push(`No hay "Relato_visual_id"`);
  }

  if (fila.donante_1_id) {
    const { data: donante } = await directus
      .items('donantes')
      .readByQuery({ filter: { id: { _eq: fila.donante_1_id } } });

    if (donante?.length && donante[0]?.id) {
      respuesta.donante = donante[0].id;
    } else {
      errata[numFila].push(`${fila.donante_1_id} no existe en colección "donantes"`);
    }
  } else {
    errata[numFila].push(`No hay "Donante"`);
  }

  if (fila['Fisiognómica_id']) {
    const { data: fisiognomica } = await directus
      .items('fisiognomicas')
      .readByQuery({ filter: { id: { _eq: fila['Fisiognómica_id'] } } });

    if (fisiognomica?.length && fisiognomica[0]?.id) {
      respuesta.fisiognomica = fisiognomica[0].id;
    } else {
      errata[numFila].push(`${fila['Fisiognómica_id']} no existe en colección "fisiognomicas"`);
    }
  } else {
    errata[numFila].push(`No hay "Fisiognómica_id"`);
  }

  if (fila.Fisiognomica_imagen_id) {
    const { data: fisiognomicaImagen } = await directus
      .items('fisiognomicas_imagen')
      .readByQuery({ filter: { id: { _eq: fila.Fisiognomica_imagen_id } } });

    if (fisiognomicaImagen?.length && fisiognomicaImagen[0]?.id) {
      respuesta.fisiognomica_imagen = fisiognomicaImagen[0].id;
    } else {
      errata[numFila].push(`${fila.Fisiognomica_imagen_id} no existe en colección "fisiognomicas_imagen"`);
    }
  } else {
    errata[numFila].push(`No hay "Fisiognomica_imagen_id"`);
  }

  if (fila.Rostro_id) {
    if (esNumero2(fila.Rostro_id)) {
      const { data: rostro } = await directus.items('rostros').readByQuery({ filter: { id: { _eq: fila.Rostro_id } } });

      if (rostro?.length && rostro[0]?.id) {
        respuesta.rostro = rostro[0].id;
      } else {
        errata[numFila].push(`${fila.Rostro_id} no existe en colección "rostros"`);
      }
    } else {
      errata[numFila].push(`${fila.Rostro_id} no en el campo "Rostro_id" no es un número.`);
    }
  } else {
    errata[numFila].push(`No hay "Rostro_id"`);
  }

  if (fila.Ciudades_origen_id) {
    const { data: ciudadOrigen } = await directus
      .items('ciudades')
      .readByQuery({ filter: { id: { _eq: fila.Ciudades_origen_id } } });

    if (ciudadOrigen?.length && ciudadOrigen[0]?.id) {
      respuesta.ciudad_origen = ciudadOrigen[0].id;
    } else {
      errata[numFila].push(`${fila.Ciudades_origen_id} no existe en colección "ciudades"`);
    }
  } else {
    errata[numFila].push(`No hay "Ciudades_origen_id"`);
  }

  if (fila.Tipo_gestual_id) {
    const { data: tipoGestual } = await directus
      .items('tipos_gestuales')
      .readByQuery({ filter: { id: { _eq: fila.Tipo_gestual_id } } });

    if (tipoGestual?.length && tipoGestual[0]?.id) {
      respuesta.tipo_gestual = tipoGestual[0].id;
    } else {
      errata[numFila].push(`${fila.Tipo_gestual_id} no existe en colección "tipos_gestuales"`);
    }
  } else {
    errata[numFila].push(`No hay "Tipo_gestual_id"`);
  }

  if (fila.Cartela_filacteria_2_id) {
    const { data: cartelaFilacteria } = await directus
      .items('cartelas_filacterias')
      .readByQuery({ filter: { id: { _eq: fila.Cartela_filacteria_2_id } } });

    if (cartelaFilacteria?.length && cartelaFilacteria[0]?.id) {
      respuesta.cartela_filacteria = cartelaFilacteria[0].id;
    } else {
      errata[numFila].push(`${fila.Cartela_filacteria_2_id} no existe en colección "cartelas_filacterias"`);
    }
  } else {
    errata[numFila].push(`No hay "Cartela_filacteria_2_id"`);
  }

  /** CATEGORÍAS */

  if (fila.categoria_1_id) {
    const { data: categoria1 } = await directus
      .items('categorias1')
      .readByQuery({ filter: { id: { _eq: fila.categoria_1_id } } });

    if (categoria1?.length && categoria1[0]?.id) {
      respuesta.categoria1 = categoria1[0].id;
    } else {
      errata[numFila].push(`${fila.categoria_1_id} no existe en colección "categorias1"`);
    }
  } else {
    errata[numFila].push(`No hay "categoria_1_id"`);
  }

  if (fila.categoria_2_id) {
    const { data: categoria2 } = await directus
      .items('categorias2')
      .readByQuery({ filter: { id: { _eq: fila.categoria_2_id } } });

    if (categoria2?.length && categoria2[0]?.id) {
      respuesta.categoria2 = categoria2[0].id;
    } else {
      errata[numFila].push(`${fila.categoria_2_id} no existe en colección "categorias2"`);
    }
  } else {
    errata[numFila].push(`No hay "categoria_2_id"`);
  }

  if (fila.categoria_3_id) {
    const { data: categoria3 } = await directus
      .items('categorias3')
      .readByQuery({ filter: { id: { _eq: fila.categoria_3_id } } });

    if (categoria3?.length && categoria3[0]?.id) {
      respuesta.categoria3 = categoria3[0].id;
    } else {
      errata[numFila].push(`${fila.categoria_3_id} no existe en colección "categorias3"`);
    }
  } else {
    //errata[numFila].push(`No hay "categoria_3_id"`);
  }

  if (fila.categoria_4_id) {
    const { data: categoria4 } = await directus
      .items('categorias4')
      .readByQuery({ filter: { id: { _eq: fila.categoria_4_id } } });

    if (categoria4?.length && categoria4[0]?.id) {
      respuesta.categoria4 = categoria4[0].id;
    } else {
      errata[numFila].push(`${fila.categoria_4_id} no existe en colección "categorias4"`);
    }
  } else {
    //errata[numFila].push(`No hay "categoria_4_id"`);
  }

  if (fila.categoria_5_id) {
    const { data: categoria5 } = await directus
      .items('categorias5')
      .readByQuery({ filter: { id: { _eq: fila.categoria_5_id } } });

    if (categoria5?.length && categoria5[0]?.id) {
      respuesta.categoria5 = categoria5[0].id;
    } else {
      errata[numFila].push(`${fila.categoria_5_id} no existe en colección "categorias5"`);
    }
  } else {
    //errata[numFila].push(`No hay "categoria_5_id"`);
  }

  if (fila.categoria_6_id) {
    const { data: categoria6 } = await directus
      .items('categorias6')
      .readByQuery({ filter: { id: { _eq: fila.categoria_6_id } } });

    if (categoria6?.length && categoria6[0]?.id) {
      respuesta.categoria6 = categoria6[0].id;
    } else {
      errata[numFila].push(`${fila.categoria_6_id} no existe en colección "categorias6"`);
    }
  } else {
    //errata[numFila].push(`No hay "categoria_6_id"`);
  }
  /** --- FIN CATEGORÍAS -- */

  /**
   * M2M
   */
  if (fila.autores_id) {
    const { data: autor } = await directus.items('autores').readByQuery({ filter: { id: { _eq: fila.autores_id } } });

    if (autor?.length && autor[0]?.id) {
      respuesta.autores = [{ autores_id: autor[0].id }];
    } else {
      errata[numFila].push(`${fila.autores_id} no existe en colección "autores"`);
    }
  } else {
    errata[numFila].push(`No hay "autores_id"`);
  }

  if (fila.tecnica_id) {
    const { data: tecnica } = await directus
      .items('tecnicas')
      .readByQuery({ filter: { id: { _eq: fila.tecnica_id } } });

    if (tecnica?.length && tecnica[0]?.id) {
      respuesta.tecnicas = [{ tecnicas_id: tecnica[0].id }];
    } else {
      errata[numFila].push(`${fila.tecnica_id} no existe en colección "tecnicas"`);
    }
  } else {
    errata[numFila].push(`No hay "tecnica_id"`);
  }

  if (fila.escenario_2_id) {
    const { data: escenario } = await directus
      .items('escenarios')
      .readByQuery({ filter: { id: { _eq: fila.escenario_2_id } } });

    if (escenario?.length && escenario[0]?.id) {
      respuesta.escenarios = [{ escenarios_id: escenario[0].id }];
    } else {
      errata[numFila].push(`${fila.escenario_2_id} no existe en colección "escenarios"`);
    }
  } else {
    errata[numFila].push(`No hay "escenario_2_id"`);
  }

  if (fila.Objetos_gestos_id) {
    const { data: objeto } = await directus
      .items('objetos')
      .readByQuery({ filter: { id: { _eq: fila.Objetos_gestos_id } } });

    if (objeto?.length && objeto[0]?.id) {
      respuesta.objetos = [{ objetos_id: objeto[0].id }];
    } else {
      errata[numFila].push(`${fila.Objetos_gestos_id} no existe en colección "objetos"`);
    }
  } else {
    errata[numFila].push(`No hay "Objetos_gestos_id"`);
  }

  const gestos = [];

  if (fila.Gesto_1_id) {
    const { data: gesto1 } = await directus.items('gestos').readByQuery({ filter: { id: { _eq: fila.Gesto_1_id } } });
    if (gesto1?.length && gesto1[0]?.id) {
      gestos.push({ gestos_id: gesto1[0].id });
    } else {
      errata[numFila].push(`${fila.Gesto_1_id} (gesto1) no existe en colección "gestos"`);
    }
  } else {
    errata[numFila].push(`No hay "Gesto_1_id"`);
  }

  if (fila.Gesto_2_id) {
    const { data: gesto2 } = await directus.items('gestos').readByQuery({ filter: { id: { _eq: fila.Gesto_2_id } } });
    if (gesto2?.length && gesto2[0]?.id) {
      gestos.push({ gestos_id: gesto2[0].id });
    } else {
      errata[numFila].push(`${fila.Gesto_2_id} (gesto2) no existe en colección "gestos"`);
    }
  } else {
    errata[numFila].push(`No hay "Gesto_2_id"`);
  }

  if (fila.Gesto_3_id) {
    const { data: gesto3 } = await directus.items('gestos').readByQuery({ filter: { id: { _eq: fila.Gesto_3_id } } });

    if (gesto3?.length && gesto3[0]?.id) {
      gestos.push({ gestos_id: gesto3[0].id });
    } else {
      errata[numFila].push(`${fila.Gesto_3_id} (gesto3) no existe en colección "gestos"`);
    }
  } else {
    errata[numFila].push(`No hay "Gesto_3_id"`);
  }

  if (gestos.length) {
    respuesta.gestos = gestos;
  }

  const personajes = [];

  if (fila.categorias_personajes_1_id) {
    const { data: personaje1 } = await directus
      .items('personajes')
      .readByQuery({ filter: { id: { _eq: fila.categorias_personajes_1_id } } });

    if (personaje1?.length && personaje1[0]?.id) {
      personajes.push({ personajes_id: personaje1[0].id });
    } else {
      errata[numFila].push(`${fila.categorias_personajes_1_id} (personaje1) no existe en colección "personajes"`);
    }
  } else {
    errata[numFila].push(`No tiene "categorias_personajes_1_id"`);
  }

  if (fila.categorias_personajes_2_id) {
    const { data: personaje2 } = await directus
      .items('personajes')
      .readByQuery({ filter: { id: { _eq: fila.categorias_personajes_2_id } } });

    if (personaje2?.length && personaje2[0]?.id) {
      personajes.push({ personajes_id: personaje2[0].id });
    } else {
      errata[numFila].push(`${fila.categorias_personajes_2_id} (personaje2) no existe en colección "personajes"`);
    }
  } else {
  }

  if (fila.categorias_personajes_3_id) {
    const { data: personaje3 } = await directus
      .items('personajes')
      .readByQuery({ filter: { id: { _eq: fila.categorias_personajes_3_id } } });

    if (personaje3?.length && personaje3[0]?.id) {
      personajes.push({ personajes_id: personaje3[0].id });
    } else {
      errata[numFila].push(`${fila.categorias_personajes_3_id} (personaje3) no existe en colección "personajes"`);
    }
  } else {
  }

  if (personajes.length) {
    respuesta.personajes = personajes;
  }

  if (fila.Id) {
    const img = await cargarImg(directus, fila.Id, fila.título);
    if (img) {
      respuesta.imagen = img.id;
    } else {
      errata[numFila].push(`id ${fila.Id} para imagen (${fila.título}) no existe en lista de imgs.`);
    }
  } else {
    errata[numFila].push(`No tiene "fila.Id" para sacar imagen`);
  }

  guardarJSON(errata, 'errata');
  return respuesta;
}

export default async (directus: Directus<ColeccionesArca>) => {
  const { data: carpetasActuales } = await directus.folders.readByQuery({ limit: -1 });
  carpetaObras = carpetasActuales?.find((obj) => obj?.name === 'Obras');
  imagenes = await listaImgs();

  if (!carpetaObras) {
    throw new Error('La carpeta "Obras" no existe');
  }

  const flujo = flujoCSV('Arca - Registro general_dic_5_2022', limpieza);
  await procesarCSV('obras', directus, flujo, procesar);
};
