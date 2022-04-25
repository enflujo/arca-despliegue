import { Autor } from './colecciones/autores';
import { ComplejoGestual } from './colecciones/complejos_gestuales';
import { Obra } from './colecciones/obras';
import { Pais } from './colecciones/paises';
import { Ubicacion } from './colecciones/ubicaciones';
import { Donante } from './colecciones/donantes';
import { Escenario } from './colecciones/escenarios';
import { Fuente } from './colecciones/fuentes';
import { Objeto } from './colecciones/objetos';
import { RelatoVisual } from './colecciones/relatos_visuales';
import { Tecnica } from './colecciones/tecnicas';

export type ColeccionesArca = {
  autores: Autor;
  complejos_gestuales: ComplejoGestual;
  donantes: Donante;
  escenarios: Escenario;
  fuentes: Fuente;
  objetos: Objeto;
  obras: Obra;
  paises: Pais;

  relatos_visuales: RelatoVisual;
  tecnicas: Tecnica;
  ubicaciones: Ubicacion;
};
