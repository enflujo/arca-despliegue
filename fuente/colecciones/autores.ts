import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

export default async () => {
  const flujo = createReadStream(`./datos/entrada/csv/Arca - Autores.csv`).pipe(
    parse({
      delimiter: ',',
      trim: true,
      columns: true,
      encoding: 'utf-8',
      skipRecordsWithEmptyValues: true,
      cast: (valor, contexto) => {
        // Convertir URLS a enlaces de HTML
        if (contexto.column === 'reference' || contexto.column === 'biography') {
          const urls = valor.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g);

          if (urls) {
            urls.forEach((url) => {
              valor = valor.replace(url, `<a href="${url}" target="_blank">${url}</a>`);
            });
          }
          return valor;
        }

        if (contexto.column === 'activity') {
          console.log(
            valor
              .replace(/(–)/g, '-')
              .split('-')
              .map((v) => v.trim())
          );

          // return valor.length ? valor.split('-') : null;
        }

        return valor;
      },
    })
  );

  for await (const autor of flujo) {
    // console.log(autor);
  }
};
