import colores from 'cli-color';

/**
 * Revisa si un Objeto de JS contiene elementos
 * https://stackoverflow.com/a/69100805/3661186
 *
 * @param {Object} x El Objeto a revisar si tiene elementos.
 * @returns {Boolean} true o false
 */
export const isEnum = (x: Object): boolean => {
  for (let p in x) return !0;
  return !1;
};

export const logCambios = colores.white.bgCyan;
export const logSinCambios = colores.white.bgBlackBright;
export const logResaltar = colores.bold;

export const mensaje = (cabeza: string, mensaje: string) => {
  return `${logResaltar(cabeza)} | ${mensaje}`;
};
