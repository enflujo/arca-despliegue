import chalk from 'chalk';

/**
 * Revisa si un Objeto de JS contiene elementos
 * https://stackoverflow.com/a/69100805/3661186
 *
 * @param {Object} x El Objeto a revisar si tiene elementos.
 * @returns {Boolean} true o false
 */
export const isEnum = (x) => {
  for (let p in x) return !0;
  return !1;
};

export const logCambios = chalk.white.bgCyan;
export const logSinCambios = chalk.white.bgGrey;
export const logResaltar = chalk.bold;
