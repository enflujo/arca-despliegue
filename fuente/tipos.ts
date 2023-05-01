import { ID, FileItem } from '@directus/sdk';

/**
 * Los tipos que contienen la palabra "Fuente" en su nombre,
 * hacen referencia al modelo anterior y se convierten al modelo descrito en el tipo con el mismo nombre, pero sin la palabra Fuente.
 * Ejemplo: "AutorFuente" pasa a ser "Autor", "ObraFuente" pasa a ser "Obra", etc.
 */

/**
 * Las colecciones creadas en el CMS.
 */
export type ColeccionesArca = {
  obras: Obra;
  autores: Autor;
  personajes: Personaje;
  fuentes: Fuente;
  ubicaciones: Ubicacion;
  ciudades: Ciudad;
  paises: Pais;
  categorias1: Categoria1;
  categorias2: Categoria2;
  categorias3: Categoria3;
  categorias4: Categoria4;
  categorias5: Categoria5;
  categorias6: SubCategoria;
  gestos: Gesto;
  objetos: CamposGeneralesColeccion;
  escenarios: CamposGeneralesColeccion;
  tecnicas: CamposGeneralesColeccion;
  donantes: CamposGeneralesColeccion;
  relatos_visuales: CamposGeneralesColeccion;
  complejos_gestuales: CamposGeneralesColeccion;
  tipos_gestuales: CamposGeneralesColeccion;
  fisiognomicas: CamposGeneralesColeccion;
  fisiognomicas_imagen: CamposGeneralesColeccion;
  cartelas_filacterias: CamposGeneralesColeccion;
  rostros: CamposGeneralesColeccion;
  simbolos: CamposGeneralesColeccion;
  descriptores: CamposGeneralesColeccion;
  caracteristicas: CamposGeneralesColeccion;
};

/**
 * Registro general bajo el nuevo modelado de datos
 * Los campos de tipo array (Autor[]) y de nombre plural se refieren a campos de M2M en el CMS.
 * Los campos de nombre singular son campos que se asignan directamente o tienen una conexión con otra colección de tipo M2O
 */
export type Obra = {
  /** Asignado automáticamente por Directus (Primary Key) */
  id?: ID;
  registro?: number;
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
  ubicacion?: ID | null;
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
  /** M2O: Gesto 1 */
  gesto1?: ID;
  /** M2O: Gesto 2 */
  gesto2?: ID;
  /** M2O: Gesto 3 */
  gesto3?: ID;

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
  /** M2M: Símbolos */
  simbolos?: (ID | { simbolos_id: ID })[];
  /** M2M: Descriptores */
  descriptores?: (ID | { descriptores_id: ID })[];
  /** M2M: Características Particulares */
  caracteristicas?: (ID | { caracteristicas_id: ID })[];
};

export type ObraFuente = {
  Id: number;
  título: string;
  fechas_actividad: string;
  Sintesis: string;
  Anotacion_Comentario_bibliográfico: string;
  Iconotexto: string;
  Relato_visual_id: number;
  Relato_visual_lista: string;
  Tipo_gestual_id: number;
  Tipo_gestual_lista: string;
  Objetos_gestos_id: number;
  Objetos_gestos_lista: string;
  Complejo_gestual_id: number;
  Complejo_gestual_lista: string;
  autores_id: number;
  Autores: string;
  escenario_2_id: number;
  Escenario: string;
  tecnica_id: number;
  Tecnica: string;
  fuente_imagen_1_id: number;
  Fuente_imagen: string;
  donante_1_id: number;
  Donante: string;
  ubicacion_id: number;
  Ubicacion: string;
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

export type Autor = {
  id?: ID;
  nombre: string;
  apellido: string;
  desde: number | null;
  desde_anotacion: string | null;
  hasta: number | null;
  hasta_anotacion: string | null;
  biografia: string;
  referencia: string;
  obras?: ID[];
};

export type AutorFuente = {
  id: number;
  name: string;
  lastname: string;
  fullname: string;
  activity: Actividad;
  biography: string;
  reference: string;
};

/**
 * La colección de países se creo sin fuente ya que la versión anterior tenía los nombres en inglés.
 * La volvemos a crear con nombres en español y GeoJSON del area a partir de datos públicos.
 */
export type Pais = {
  id?: ID;
  nombre: string;
  slug?: string;
  geo: object;
};

export type Ciudad = {
  id?: ID;
  nombre: string;
  pais?: ID;
  ubicaciones?: ID[];
  obras_origen?: ID[];
  obras?: ID[];
};

export type CiudadFuente = {
  id: number;
  name: string;
  pais: string;
};

export type Ubicacion = {
  id?: ID;
  nombre: string;
  anotacion: string | null;
  geo?: string;
  ciudad?: ID;
  obras?: ID[];
};

export type UbicacionFuente = {
  id: number;
  name: string;
  Lugar: string;
  latitud: number;
  longitud: number;
  'lugar/ubicación': string;
  Anotación: string;
};

/**
 * Las fuentes no tienen campo nombre o slug ya que no se tratan como datos visualizables.
 */
export type Fuente = {
  id?: ID;
  descripcion: string;
  obras?: ID[];
};

export type FuenteFuente = {
  id: number;
  name: string;
};

export type Gesto = {
  id?: ID;
  codigo: string | null;
  nombre: string;
  descripcion?: string;
  obras_gesto_1?: ID[];
  obras_gesto_2?: ID[];
  obras_gesto_3?: ID[];
};

export type GestoFuente = {
  id: number;
  Nombre: string;
  'Nombre de registro': string;
};

export type Personaje = {
  id?: ID;
  nombre: string;
  slug?: string;
  descripcion: string;
  fuente: string;
  muerte: number | null;
  muerte_anotacion: string | null;
  beatificacion_canonizacion_desde: number | string | null;
  beatificacion_canonizacion_desde_anotacion: string | null;
  beatificacion_canonizacion_hasta: number | string | null;
  beatificacion_canonizacion_hasta_anotacion: string | null;
  obras?: ID[];
};

export type PersonajeFuente = {
  id: number;
  name: string;
  text: string;
  'Fecha muerte': ActividadObjeto;
  'Fecha beatificación / canonización': Actividad;
  source: string;
};

export interface Categoria {
  id?: ID;
  nombre: string;
  slug?: string;
  descripcion?: string;
  obras?: Obra[];
}

export interface SubCategoria extends Categoria {
  ancestro?: ID;
}

export interface Categoria1 extends Categoria {
  imagen?: FileItem;
  categorias2?: ID[];
}

export interface Categoria2 extends SubCategoria {
  categorias3?: ID[];
}

export interface Categoria3 extends SubCategoria {
  categorias4?: ID[];
}

export interface Categoria4 extends SubCategoria {
  categorias5?: ID[];
}

export interface Categoria5 extends SubCategoria {
  categorias6?: ID[];
}

// Categoria6 es exactamente SubCategoria ya que no tiene categorias subsecuentes.

export type CategoriaFuente = {
  id: number;
  name: string;
  ancestry: string;
};

/**
 * Este modelo se usa en casi todas las colecciones de ahora en adelante.
 */
export type CamposGeneralesColeccion = {
  id?: ID;
  nombre: string;
  slug?: string;
  descripcion?: string;
  obras?: ID[];
};

/**
 * Aunque son muy parecidas en su estructura, el modelado anterior nombraba los campos de maneras inconsistentes: en inglés o español y a veces con mayúsculas.
 * Se crea un tipo para cada fuente para no tener confusiones al revisar los campos.
 */
export type ComplejoGestualFuente = {
  id: number;
  nombre: string;
};

export type DonanteFuente = {
  id: number;
  name: string;
};

export type EscenarioFuente = {
  id: number;
  name: string;
};

export type ObjetoFuente = {
  id: number;
  nombre: string;
};

export type RelatoVisualFuente = {
  id: number;
  Nombre: string;
};

export type TecnicaFuente = {
  id: number;
  name: string;
};

export type FisiognomicaFuente = {
  id: number;
  Nombre: string;
};

export type FisiognomicaImagenFuente = {
  id: number;
  nombre: string;
};

export type RostroFuente = {
  id: number;
  Nombre: string;
};

export type TipoGestualFuente = {
  id: number;
  nombre: string;
};

export type CartelaFilacteriaFuente = {
  id: number;
  name: string;
};

export type SimbolosFuente = {
  id: number;
  name: string;
};

export type DescriptoresFuente = {
  id: number;
  description: string;
};

export type CaracteristicasFuente = {
  id: number;
  name: string;
};

/**
 * Otros tipos de uso general
 */

export type Actividad = {
  desde: ActividadObjeto;
  hasta: ActividadObjeto;
};

export type ActividadObjeto = {
  fecha: number | null;
  anotacion: string | null;
};
