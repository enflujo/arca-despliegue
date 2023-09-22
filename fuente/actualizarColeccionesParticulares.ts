import 'dotenv/config';
import type { ColeccionesArca, Obra, ObraFuente } from './tipos';
import { Directus } from '@directus/sdk';
import type { ID } from '@directus/sdk';
import type { CastingContext } from 'csv-parse/.';
import { flujoCSV, procesarCSV } from './utilidades/ayudas';
import ubicaciones from './colecciones/ubicaciones';

const url = process.env.AMBIENTE === 'produccion' ? 'https://apiarca.uniandes.edu.co' : 'http://localhost:8055';

const nuevas: { id: number; nombre: string; lat: string; lon: string; ciudad: string; pais: string; idArca?: ID }[] = [
  { id: 39, nombre: 'Colección particular', lat: '0', lon: '0', ciudad: '(Sin datos)', pais: '' },
  {
    id: 1218,
    nombre: 'Colección particular (Buenos Aires)',
    lat: '-34.60774838',
    lon: '-58.37243334',
    ciudad: 'Buenos Aires',
    pais: 'Argentina',
  },
  {
    id: 1535,
    nombre: 'Colección particular (Córdoba)',
    lat: '-31.41675232',
    lon: '-64.1835478',
    ciudad: 'Córdoba',
    pais: 'Argentina',
  },
  {
    id: 1537,
    nombre: 'Colección particular (Salta)',
    lat: '-24.78898664',
    lon: '-65.41030972',
    ciudad: 'Salta',
    pais: 'Argentina',
  },
  {
    id: 1538,
    nombre: 'Colección particular (Salvador de Jujuy)',
    lat: '-24.18729156',
    lon: '-65.29960017',
    ciudad: 'San Salvador de Jujuy',
    pais: 'Argentina',
  },
  {
    id: 1540,
    nombre: 'Colección particular (Santa Fe, Ar)',
    lat: '-31.64882517',
    lon: '-60.70900352',
    ciudad: 'Santa Fe - Ar',
    pais: 'Argentina',
  },
  {
    id: 1542,
    nombre: 'Colección particular (La Paz)',
    lat: '-16.49568881',
    lon: '-68.13349956',
    ciudad: 'La Paz',
    pais: 'Bolivia',
  },
  {
    id: 1544,
    nombre: 'Colección particular (Potosí)',
    lat: '-19.58924925',
    lon: '-65.75349239',
    ciudad: 'Potosí',
    pais: 'Bolivia',
  },
  {
    id: 1546,
    nombre: 'Colección particular (Sucre)',
    lat: '-19.04803781',
    lon: '-65.25949022',
    ciudad: 'Sucre',
    pais: 'Bolivia',
  },
  {
    id: 1548,
    nombre: 'Colección particular (Brasília)',
    lat: '-15.79905894',
    lon: '-47.86606861',
    ciudad: 'Brasília',
    pais: 'Brasil',
  },
  {
    id: 1549,
    nombre: 'Colección particular (Rio de Janeiro)',
    lat: '-22.90667004',
    lon: '-43.1887057',
    ciudad: 'Rio de Janeiro',
    pais: 'Brasil',
  },
  {
    id: 1550,
    nombre: 'Colección particular (Salvador de Bahía)',
    lat: '-12.97308096',
    lon: '-38.50992899',
    ciudad: 'Salvador de Bahía',
    pais: 'Brasil',
  },
  {
    id: 1552,
    nombre: 'Colección particular (São Paulo)',
    lat: '-23.5504542',
    lon: '-46.63342267',
    ciudad: 'São Paulo',
    pais: 'Brasil',
  },
  {
    id: 1553,
    nombre: 'Colección particular (Santiago)',
    lat: '-33.43781925',
    lon: '-70.65055503',
    ciudad: 'Santiago',
    pais: 'Chile',
  },
  {
    id: 1557,
    nombre: 'Colección particular (Bogotá)',
    lat: '4.598062287',
    lon: '-74.07612924',
    ciudad: 'Bogotá',
    pais: 'Colombia',
  },
  {
    id: 1558,
    nombre: 'Colección particular (Cali)',
    lat: '3.452076943',
    lon: '-76.53249885',
    ciudad: 'Cali',
    pais: 'Colombia',
  },
  {
    id: 1559,
    nombre: 'Colección particular (Chiquinquirá)',
    lat: '5.619359082',
    lon: '-73.81826271',
    ciudad: 'Chiquinquirá',
    pais: 'Colombia',
  },
  {
    id: 1562,
    nombre: 'Colección particular (Medellín)',
    lat: '6.252535365',
    lon: '-75.56473025',
    ciudad: 'Medellín',
    pais: 'Colombia',
  },
  {
    id: 1568,
    nombre: 'Colección particular (Pamplona)',
    lat: '7.376241286',
    lon: '-72.64818245',
    ciudad: 'Pamplona',
    pais: 'Colombia',
  },
  {
    id: 1570,
    nombre: 'Colección particular (Santa Fe de Antioquia)',
    lat: '6.556428475',
    lon: '-75.82763102',
    ciudad: 'Santa Fe de Antioquia',
    pais: 'Colombia',
  },
  {
    id: 1573,
    nombre: 'Colección particular (Tunja)',
    lat: '5.532417241',
    lon: '-73.36152978',
    ciudad: 'Tunja',
    pais: 'Colombia',
  },
  {
    id: 1577,
    nombre: 'Colección particular (Pasto)',
    lat: '1.214462384',
    lon: '-77.2782288',
    ciudad: 'Pasto',
    pais: 'Colombia',
  },
  {
    id: 1578,
    nombre: 'Colección particular (Popayán)',
    lat: '2.442202882',
    lon: '-76.60616903',
    ciudad: 'Popayán',
    pais: 'Colombia',
  },
  {
    id: 1581,
    nombre: 'Colección particular (La Habana)',
    lat: '23.1402393',
    lon: '-82.3493314',
    ciudad: 'La Habana',
    pais: 'Cuba',
  },
  {
    id: 1584,
    nombre: 'Colección particular (Guayaquil)',
    lat: '-2.194778204',
    lon: '-79.88313637',
    ciudad: 'Guayaquil',
    pais: 'Ecuador',
  },
  {
    id: 1585,
    nombre: 'Colección particular (Quito)',
    lat: '-0.2201103676',
    lon: '-78.51212139',
    ciudad: 'Quito',
    pais: 'Ecuador',
  },
  {
    id: 1586,
    nombre: 'Colección particular (Barcelona)',
    lat: '41.38738643',
    lon: '2.169945122',
    ciudad: 'Barcelona',
    pais: 'España',
  },
  {
    id: 1592,
    nombre: 'Colección particular (Madrid)',
    lat: '40.41557822',
    lon: '-3.707390972',
    ciudad: 'Madrid',
    pais: 'España',
  },
  {
    id: 1593,
    nombre: 'Colección particular (Denver)',
    lat: '39.74031471',
    lon: '-104.9903433',
    ciudad: 'Denver',
    pais: 'Estados Unidos',
  },
  {
    id: 1594,
    nombre: 'Colección particular (Nueva York)',
    lat: '40.75313402',
    lon: '-73.98242586',
    ciudad: 'Nueva York',
    pais: 'Estados Unidos',
  },
  {
    id: 1595,
    nombre: 'Colección particular (Washington)',
    lat: '38.89011119',
    lon: '-77.03566468',
    ciudad: 'Washington',
    pais: 'Estados Unidos',
  },
  {
    id: 1596,
    nombre: 'Colección particular (Picuris)',
    lat: '36.20020973',
    lon: '-105.7086921',
    ciudad: 'Pícuris',
    pais: 'Estados Unidos',
  },
  {
    id: 1597,
    nombre: 'Colección particular (San Antonio)',
    lat: '29.42371277',
    lon: '-98.49073072',
    ciudad: 'San Antonio',
    pais: 'Estados Unidos',
  },
  {
    id: 1598,
    nombre: 'Colección particular (Santa Bárbara)',
    lat: '34.42832621',
    lon: '-119.7060509',
    ciudad: 'Santa Bárbara',
    pais: 'Estados Unidos',
  },
  {
    id: 1599,
    nombre: 'Colección particular (París)',
    lat: '48.85430741',
    lon: '2.346632332',
    ciudad: 'París',
    pais: 'Francia',
  },
  {
    id: 1600,
    nombre: 'Colección particular (Guatemala)',
    lat: '14.64182829',
    lon: '-90.5136634',
    ciudad: 'Guatemala',
    pais: 'Guatemala',
  },
  {
    id: 1601,
    nombre: 'Colección particular (Tegucigalpa)',
    lat: '14.10594455',
    lon: '-87.20463696',
    ciudad: 'Tegucigalpa',
    pais: 'Honduras',
  },
  {
    id: 1603,
    nombre: 'Colección particular (Dublin)',
    lat: '53.34037558',
    lon: '-6.271202925',
    ciudad: 'Dublin',
    pais: 'Irlanda',
  },
  {
    id: 1612,
    nombre: 'Colección particular (Londres)',
    lat: '51.50750027',
    lon: '-0.127779077',
    ciudad: 'Londres',
    pais: 'Reino Unido',
  },
  {
    id: 1613,
    nombre: 'Colección particular (Chalchicomula)',
    lat: '18.98786019',
    lon: '-97.44771413',
    ciudad: 'Chalchicomula de Cerdán',
    pais: 'México',
  },
  {
    id: 1614,
    nombre: 'Colección particular (Cholula)',
    lat: '19.06262521',
    lon: '-98.30631483',
    ciudad: 'Cholula',
    pais: 'México',
  },
  {
    id: 1615,
    nombre: 'Colección particular (CdMx)',
    lat: '19.43263342',
    lon: '-99.1332733',
    ciudad: 'Ciudad de México',
    pais: 'México',
  },
  {
    id: 1620,
    nombre: 'Colección particular (Cd Júarez)',
    lat: '31.73905805',
    lon: '-106.4867502',
    ciudad: 'Ciudad Juárez',
    pais: 'México',
  },
  {
    id: 1621,
    nombre: 'Colección particular (Cuernavaca)',
    lat: '18.92179494',
    lon: '-99.23430684',
    ciudad: 'Cuernavaca',
    pais: 'México',
  },
  {
    id: 1622,
    nombre: 'Colección particular (Guadalajara)',
    lat: '20.67609198',
    lon: '-103.3469507',
    ciudad: 'Guadalajara',
    pais: 'México',
  },
  {
    id: 1624,
    nombre: 'Colección particular (Monterrey)',
    lat: '25.66910595',
    lon: '-100.3098501',
    ciudad: 'Monterrey',
    pais: 'México',
  },
  {
    id: 1625,
    nombre: 'Colección particular (Oaxaca)',
    lat: '17.06106598',
    lon: '-96.72532631',
    ciudad: 'Oaxaca',
    pais: 'México',
  },
  {
    id: 1626,
    nombre: 'Colección particular (Ozumba)',
    lat: '19.69855462',
    lon: '-98.75376496',
    ciudad: 'Otumba',
    pais: 'México',
  },
  {
    id: 1628,
    nombre: 'Colección particular (Puebla)',
    lat: '19.0436821',
    lon: '-98.1981405',
    ciudad: 'Puebla',
    pais: 'México',
  },
  {
    id: 1631,
    nombre: 'Colección particular (San Miguel Allende)',
    lat: '20.91430776',
    lon: '-100.7437392',
    ciudad: 'San Miguel Allende',
    pais: 'México',
  },
  {
    id: 1632,
    nombre: 'Colección particular (Tehuacán)',
    lat: '18.46251558',
    lon: '-97.39275149',
    ciudad: 'Tehuacán',
    pais: 'México',
  },
  {
    id: 1634,
    nombre: 'Colección particular (Tepotzotlán)',
    lat: '19.71375104',
    lon: '-99.22336257',
    ciudad: 'Tepotzotlán',
    pais: 'México',
  },
  {
    id: 1636,
    nombre: 'Colección particular (Tuxtla Gutiérrez)',
    lat: '16.75412336',
    lon: '-93.11562476',
    ciudad: 'Tuxtla Gutiérrez',
    pais: 'México',
  },
  {
    id: 1638,
    nombre: 'Colección particular (Zacatecas)',
    lat: '22.77145124',
    lon: '-102.573583',
    ciudad: 'Zacatecas',
    pais: 'México',
  },
  {
    id: 1639,
    nombre: 'Colección particular (Ámsterdam)',
    lat: '52.37005944',
    lon: '4.893958711',
    ciudad: 'Ámsterdam',
    pais: 'Países Bajos',
  },
  {
    id: 1642,
    nombre: 'Colección particular (Arequipa)',
    lat: '-16.3988224',
    lon: '-71.53688737',
    ciudad: 'Arequipa',
    pais: 'Perú',
  },
  {
    id: 1643,
    nombre: 'Colección particular (Cuzco)',
    lat: '-13.51683346',
    lon: '-71.97872604',
    ciudad: 'Cuzco',
    pais: 'Perú',
  },
  {
    id: 1645,
    nombre: 'Colección particular (Juli)',
    lat: '-16.2132836',
    lon: '-69.45931776',
    ciudad: 'Juli',
    pais: 'Perú',
  },
  {
    id: 1646,
    nombre: 'Colección particular (Lima)',
    lat: '-12.04570476',
    lon: '-77.03051898',
    ciudad: 'Lima',
    pais: 'Perú',
  },
  {
    id: 1648,
    nombre: 'Colección particular (Lisboa)',
    lat: '38.70972691',
    lon: '-9.133679018',
    ciudad: 'Lisboa',
    pais: 'Portugal',
  },
  {
    id: 1649,
    nombre: 'Colección particular (Caracas)',
    lat: '10.48974971',
    lon: '-66.88532084',
    ciudad: 'Caracas',
    pais: 'Venezuela',
  },
  {
    id: 1651,
    nombre: 'Colección particular (Montevideo)',
    lat: '-34.90749604',
    lon: '-56.20799099',
    ciudad: 'Montevideo',
    pais: 'Uruguay',
  },
  {
    id: 1652,
    nombre: 'Colección particular (San Juan)',
    lat: '18.46913206',
    lon: '-66.12141053',
    ciudad: 'San Juan',
    pais: 'Puerto Rico',
  },
];
const directus = new Directus<ColeccionesArca>(url, {
  auth: {
    staticToken: process.env.KEY,
  },
  transport: {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  },
});

// async function inicio() {
//   const coleccion = directus.items('obras');
//   const { meta } = await coleccion.readByQuery({ limit: 0, meta: 'total_count' });
//   const { total_count } = meta as ItemMetadata;
//   const bloque = 100;
//   const numPaginas = Math.ceil((total_count as number) / bloque);
//   const paginas = Array.from(Array(numPaginas).keys());

//   for await (const pagina of paginas) {
//     const { data } = await coleccion.readByQuery({
//       limit: bloque,
//       fields: ['id', 'ubicacion', 'registro'],
//       page: pagina + 1,
//     });

//     if (data) {
//       for await (const entrada of data) {
//         if (entrada.ubicacion) {
//           const datos = {
//             gesto1: gesto1 && gesto1.gestos_id ? gesto1.gestos_id : undefined,
//             gesto2: gesto2 && gesto2.gestos_id ? gesto2.gestos_id : undefined,
//             gesto3: gesto3 && gesto3.gestos_id ? gesto3.gestos_id : undefined,
//             gestos: [],
//           };

//           console.log('Actualizando registro', entrada.registro);
//           await coleccion.updateOne(entrada.id as ID, datos);
//         }
//       }
//     }
//   }

// }

inicio();

function limpieza(valor: string, contexto: CastingContext): string {
  return valor;
}

async function procesar(fila: ObraFuente): Promise<Obra | null> {
  const coleccionObras = directus.items('obras');
  if (fila.ubicacion_id) {
    const esNueva = nuevas.find(({ id }) => id == fila.ubicacion_id);

    if (esNueva) {
      const { data } = await coleccionObras.readByQuery({ filter: { registro: { _eq: fila.Id } } });

      if (data?.length) {
        const obra = data[0];

        if (obra.id && obra.ubicacion != fila.ubicacion_id) {
          await coleccionObras.updateOne(obra.id, { ubicacion: esNueva.idArca });
          console.log('Obra actualizada', obra.registro);
        } else {
          console.log('ya esta actualizado', obra.id, obra.ubicacion, esNueva.idArca);
        }
      } else {
        console.log('La obra con registro', fila.Id, 'no existe');
      }
    }
  }
  return null;
}

async function inicio() {
  const coleccionUbicaciones = directus.items('ubicaciones');

  for await (const ubicacion of nuevas) {
    const { data } = await coleccionUbicaciones.readByQuery({ filter: { nombre: { _eq: ubicacion.nombre } } });

    if (!data?.length) {
      const ciudad = await directus.items('ciudades').readByQuery({ filter: { nombre: { _eq: ubicacion.ciudad } } });

      if (ciudad.data && ciudad.data.length) {
        const pais = await directus.items('paises').readByQuery({ filter: { nombre: { _eq: ubicacion.pais } } });

        if (pais.data && pais.data.length) {
          const geo = JSON.stringify({
            coordinates: [ubicacion.lon, ubicacion.lat],
            type: 'Point',
          });

          const entrada = await coleccionUbicaciones.createOne({
            nombre: ubicacion.nombre,
            geo,
            ciudad: ciudad.data[0].id,
          });

          console.log(entrada);
          ubicacion.idArca = entrada?.id;
          console.log('Nueva ubicación creada:', ubicacion.nombre);
        } else {
          console.log('no se encuentra ciudad', ciudad.data[0].nombre, 'en', ubicacion.pais);
        }
        // if (ciudad.data.length) {
        // }
        // console.log(ubicacion, ciudad);
      } else {
        console.log('no encuentra la ciudad', ubicacion.ciudad);
      }

      //
    } else {
      // console.log('ya existe ubicación', ubicacion.nombre);
      ubicacion.idArca = data[0].id;
    }
  }

  const flujo = flujoCSV('Arca - Registro general_ubicaciones', limpieza);
  await procesarCSV('descriptores', directus, flujo, procesar);
  console.log('FIN');
}
