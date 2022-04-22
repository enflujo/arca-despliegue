import { SettingItem } from '@directus/sdk';

export type ImgArca = {
  nombre: string;
  ruta: string;
};

export type ArcaSettings = {
  [key: keyof SettingItem]: string | number;
};

export type ModeloSettings = {
  settings: ArcaSettings;
  folders: string[];
  imgsSistema: ImgArca[];
};

export const datosSettings: ModeloSettings = {
  settings: {
    project_name: 'Proyecto Arca',
    project_url: 'https://arca.uniandes.edu.co',
    project_color: '#af2828',
    public_note: 'Administrador de contenido del proyecto ARCA.',
    storage_asset_transform: 'presets',
    project_descriptor: 'CMS',
  },
  folders: ['Sistema', 'Obras'],
  imgsSistema: [{ nombre: 'Icono Arca', ruta: './imgs/arca-icono.svg' }],
};
