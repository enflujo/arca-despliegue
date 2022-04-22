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

export const logCambios = colores.black.bgCyan;
export const logSinCambios = colores.white.bgBlackBright;
export const logResaltar = colores.bold;
export const logError = colores.red.bold;

export const mensaje = (cabeza: string, mensaje: string) => {
  return `${logResaltar(cabeza)} | ${mensaje}`;
};

/**
 * Revisa si el valor de un texto contiene un número.
 *
 * @param valor {string} Texto a revisar
 * @returns {Boolean} true o false
 */
export const esNumero = (valor: string): boolean => !isNaN(parseInt(valor));

export const urlsAEnlacesHTML = (valor: string): string => {
  const urls = valor.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=A-zÀ-ú]+)/g);

  if (urls) {
    urls.forEach((url) => {
      valor = valor.replace(url, `<a href="${url}" target="_blank">${url}</a>`);
    });
  }
  return valor;
};
