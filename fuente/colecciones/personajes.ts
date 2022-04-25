import { ID } from '@directus/sdk';

export type Personaje = {
  id?: ID;
  nombre: string;
  biografia: string;
  fecha_muerte: number | string;
  fecha_muerte_anotacion: string;
  fecha_beatificacion_canonizacion: number | string;
  fecha_beatificacion_canonizacion_anotacion: string;
  fuente: string;
};

export type PersonajeFuente = {
  id: number;
  name: string;
  text: string;
  'Fecha muerte': string;
  'Fecha beatificación / canonización': string;
  source: string;
};
