import { Autor } from './colecciones/autores';
import { ComplejoGestual } from './colecciones/complejos_gestuales';
import { Pais } from './colecciones/paises';
import { Ubicacion } from './colecciones/ubicaciones';
import { Donante } from './colecciones/donantes';
import { Escenario } from './colecciones/escenarios';
import { Fuente } from './colecciones/fuentes';
import { Objeto } from './colecciones/objetos';
import { RelatoVisual } from './colecciones/relatos_visuales';
import { Tecnica } from './colecciones/tecnicas';
import { FileItem, ID } from '@directus/sdk';

export type ColeccionesArca = {
  autores: Autor;
  paises: Pais;
  objetos: Objeto;
  escenarios: Escenario;
  tecnicas: Tecnica;
  fuentes: Fuente;
  donantes: Donante;
  relatos_visuales: RelatoVisual;
  complejos_gestuales: ComplejoGestual;
  // EN PROCESO
  ubicaciones: Ubicacion;

  obras: Obra;
};

/**
 * Registro general bajo el nuevo modelado de datos
 * Los campos de tipo array (Autor[]) y de nombre plural se refieren a campos de M2M en el CMS.
 * Los campos de nombre singular son campos que se asignan directamente o tienen una conexión con otra colección de tipo M2O
 */
export type Obra = {
  /** Asignado automáticamente por Directus (Primary Key) */
  id?: ID;
  /**
   * ..:: Se asignan directamente en el registro ::..
   */
  /** Directo: Titulo de la obra */
  titulo: string;
  /** Directo: Imagen de la obra */
  // imagen: FileItem;

  /**
   * ..:: Relaciones "Many to One" (M2O) - Sólo se les puede asignar 1 valor ::..
   */

  /** M2O: Fuente de la imagen */
  fuente?: ID;
  // /** M2O: Ubicación donde se encuentra la obra */
  // ubicacion: Ubicacion;
  // /** M2O: Tipo de donante de la obra */
  donante?: ID;
  // /** M2O: Categoría que describe el relato visual */
  // relato_visual: RelatoVisual;
  // /** M2O: Complejo gestual */
  // complejo_gestual: ComplejoGestual;

  // /**
  //  * ..:: Relaciones "Many to Many" (M2M) - Permite más de 1 valor ::..
  //  */
  // /** M2M: Autores de la obra */
  autores?: ID[];
  // /** M2M: Objetos Gestos */
  // objetos: Objeto[];
  // /** M2M: Escenario */
  // escenarios: Escenario[];
  // /** M2M: Técnicas */
  // tecnicas: Tecnica[];
};

export type ObraFuente = {
  Id: number;

  categorias_personajes_1_id: number;
  categorias_personajes_1: string;
  categorias_personajes_2_id: number;
  categorias_personajes_2: string;
  categorias_personajes_3_id: number;
  categorias_personajes_3: string;

  /** */
  autores_id: number;
  Autores: string;

  /** */
  escenario_2_id: number;
  Escenario: string;

  /** */
  tecnica_id: number;
  Tecnica: string;

  /** */
  fuente_imagen_1_id: number;
  Fuente_imagen: string;

  /** */
  donante_1_id: number;
  Donante: string;

  Ciudades_origen_id: number;
  Ciudad_Origen: string;
  Ciudades_actual_id: number;
  Ciudad_Actual: string;

  Paises_origen_id: number;
  Pais_Origen: string;
  Paises_actual_id: number;
  Pais_Actual: string;

  /** */
  ubicacion_id: number;
  Ubicacion: string;

  categoria_1_id: number;
  Categoria_1: string;
  categoria_2_id: number;
  Categoria_2: string;
  categoria_3_id: number;
  Categoria_3: string;
  categoria_4_id: number;
  Categoria_4: string;
  categoria_5_id: number;
  Categoria_5: string;
  categoria_6_id: number;
  Categoria_6: string;

  /** ..:: Directos ::.. */
  título: string;
  fechas_actividad: string;
  Sintesis: string;
  Anotacion_Comentario_bibliográfico: string;
  Iconotexto: string;

  /** */
  Relato_visual_id: number;
  Relato_visual_lista: string;

  Tipo_gestual_id: number;
  Tipo_gestual_lista: string;

  /** */
  Objetos_gestos_id: number;
  Objetos_gestos_lista: string;

  /** */
  Complejo_gestual_id: number;
  Complejo_gestual_lista: string;

  Gesto_1_id: number;
  Gesto_1: string;
  Gesto_2_id: number;
  Gesto_2: string;
  Gesto_3_id: number;
  Gesto_3: string;

  Fisiognómica_id: number;
  Fisiognómica_lista: string;

  Fisiognomica_imagen_id: number;
  Fisiognomica_imagen_lista: string;

  Cartela_filacteria_2_id: number;
  Cartela_filacteria_2_lista: string;

  Rostro_id: number;
  Rostro_lista: string;

  Anotación_gestual: string;
};
