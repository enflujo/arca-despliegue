import { Autor } from './colecciones/autores';
import { ComplejoGestual } from './colecciones/complejosGestuales';
import { Pais } from './colecciones/paises';
import { Ubicacion } from './colecciones/ubicaciones';
import { Donante } from './colecciones/donantes';
import { Escenario } from './colecciones/escenarios';
import { Fuente } from './colecciones/fuentes';
import { Objeto } from './colecciones/objetos';
import { RelatoVisual } from './colecciones/relatosVisuales';
import { Tecnica } from './colecciones/tecnicas';
import { FileItem, ID } from '@directus/sdk';
import { Gesto } from './colecciones/gestos';
import { Fisiognomica } from './colecciones/fisiognomicas';
import { FisiognomicaImagen } from './colecciones/fisiognomicasImagen';
import { Rostro } from './colecciones/rostros';
import { Ciudad } from './colecciones/ciudades';
import { Personaje } from './colecciones/personajes';
import { TipoGestual } from './colecciones/tiposGestuales';
import { CartelaFilacteria } from './colecciones/cartelasFilacterias';
import { Categoria1 } from './colecciones/categorias1';
import { Categoria2 } from './colecciones/categorias2';
import { Categoria3 } from './colecciones/categorias3';
import { Categoria4 } from './colecciones/categorias4';
import { Categoria5 } from './colecciones/categorias5';
import { Categoria6 } from './colecciones/categorias6';

export type ColeccionesArca = {
  autores: Autor;
  paises: Pais;
  ciudades: Ciudad;
  objetos: Objeto;
  escenarios: Escenario;
  tecnicas: Tecnica;
  fuentes: Fuente;
  donantes: Donante;
  relatos_visuales: RelatoVisual;
  complejos_gestuales: ComplejoGestual;
  tipos_gestuales: TipoGestual;
  gestos: Gesto;
  fisiognomicas: Fisiognomica;
  fisiognomicas_imagen: FisiognomicaImagen;
  rostros: Rostro;
  ubicaciones: Ubicacion;
  personajes: Personaje;
  cartelas_filacterias: CartelaFilacteria;
  categorias1: Categoria1;
  categorias2: Categoria2;
  categorias3: Categoria3;
  categorias4: Categoria4;
  categorias5: Categoria5;
  categorias6: Categoria6;

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
  registro?: string;
  /**
   * ..:: Se asignan directamente en el registro ::..
   */
  /** Directo: Titulo de la obra */
  titulo: string;
  /** Directo: Imagen de la obra */
  imagen?: string;
  /** Directo: Síntesis */
  sintesis?: string;
  /** Directo: Comentario Bibliográfico */
  comentario_bibliografico?: string;
  /** Iconotexto */
  iconotexto?: string;

  /** Directo: ¿la fecha es un periodo? permite hacer visible el campo fecha_final */
  fecha_periodo: boolean;

  /** Directo: Fecha inicial o exacta */
  fecha_inicial?: number;

  /** Directo: Fecha final (sólo cuando es periodo) */
  fecha_final?: number;

  /**
   * ..:: Relaciones "Many to One" (M2O) - Sólo se les puede asignar 1 valor ::..
   */

  /** M2O: Fuente de la imagen */
  fuente?: ID;
  /** M2O: Ubicación donde se encuentra la obra */
  ubicacion?: ID;
  /** M2O: Tipo de donante de la obra */
  donante?: ID;
  /** M2O: Categoría que describe el relato visual */
  relato_visual?: ID;
  /** M2O: Complejos Gestuales */
  complejo_gestual?: ID;
  /** M2O: Tipos Gestuales */
  tipo_gestual?: ID;
  /** M2O: Fisiognómicas */
  fisiognomica?: ID;
  /** M2O: Fisiognómicas Imagen */
  fisiognomica_imagen?: ID;
  /** M2O: Rostro */
  rostro?: ID;
  /** M2O: Ciudad Origen */
  ciudad_origen?: ID;
  /** M2O: Cartela Filacteria */
  cartela_filacteria?: ID;
  /** M2O: Categoria 1 */
  categoria1?: ID;
  /** M2O: Categoria 2 */
  categoria2?: ID;
  /** M2O: Categoria 3 */
  categoria3?: ID;
  /** M2O: Categoria 4 */
  categoria4?: ID;
  /** M2O: Categoria 5 */
  categoria5?: ID;
  /** M2O: Categoria 6 */
  categoria6?: ID;

  /**
   * ..:: Relaciones "Many to Many" (M2M) - Permite más de 1 valor ::..
   */
  /** M2M: Autores de la obra */
  autores?: { autores_id: ID }[];
  /** M2M: Objetos Gestos */
  objetos?: { objetos_id: ID }[];
  /** M2M: Escenario */
  escenarios?: { escenarios_id: ID }[];
  /** M2M: Técnicas */
  tecnicas?: { tecnicas_id: ID }[];
  /** M2M: Gestos */
  gestos?: { gestos_id: ID }[];
  /** M2M: Personajes */
  personajes?: { personajes_id: ID }[];
};

export type ObraFuente = {
  Id: number;

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

  /** */
  ubicacion_id: number;
  Ubicacion: string;

  /** */
  Gesto_1_id: number;
  Gesto_1: string;
  Gesto_2_id: number;
  Gesto_2: string;
  Gesto_3_id: number;
  Gesto_3: string;

  /** */
  Fisiognómica_id: number;
  Fisiognómica_lista: string;

  /** */
  Fisiognomica_imagen_id: number;
  Fisiognomica_imagen_lista: string;

  /** */
  Rostro_id: number;
  Rostro_lista: string;

  categorias_personajes_1_id: number;
  categorias_personajes_1: string;
  categorias_personajes_2_id: number;
  categorias_personajes_2: string;
  categorias_personajes_3_id: number;
  categorias_personajes_3: string;

  Ciudades_origen_id: number;
  Ciudad_Origen: string;
  Ciudades_actual_id: number;
  Ciudad_Actual: string;

  Paises_origen_id: number;
  Pais_Origen: string;
  Paises_actual_id: number;
  Pais_Actual: string;

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

  Cartela_filacteria_2_id: number;
  Cartela_filacteria_2_lista: string;

  Anotación_gestual: string;
};

export type Actividad = {
  desde: ActividadObjeto;
  hasta: ActividadObjeto;
};

export type ActividadObjeto = {
  fecha: number | null;
  anotacion: string | null;
};
