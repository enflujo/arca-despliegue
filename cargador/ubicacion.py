#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# # Alimentador obra - ubicación
# 
# Notebook para completar la ubicación de obras con ciudad y país anterior
import os
import sys
import datetime
import logging
import json
import numpy as np
import requests
import pandas as pd
from dotenv import load_dotenv


# ## Abrir tablas y filtrar datos
# 
# 
class Ubicacion:
    def __init__(self):

        self.timestamp = datetime.datetime.now()

        logging.basicConfig(level=logging.DEBUG, 
            filename=f'../logs/ubicaciones-{self.timestamp.isoformat()}.log', 
            filemode='w'
        )
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

        self.config = json.load(open('../config/config.json'))
        self.rename_dict = self.config['fields_map']
        obrascsv = '../datos/entrada/csv/Registro general.csv'
        ubsl = pd.read_csv('../datos/entrada/csv/Ubicacion_1_ Lista.csv')
        ubsl = ubsl.dropna(how='all')
        ubsl.dropna(subset=['id'])
        # dataframes de las tablas
        obras = pd.read_csv(obrascsv, dtype=str)
        obras = obras.rename(columns=self.rename_dict)
        obras = obras.dropna(how='all')
        obras = obras.fillna('')

        self.ubicaciones = obras.drop_duplicates(subset='id_ubicacion')
        logging.debug(f'ubicaciones en obra: {len(self.ubicaciones.index)}')
        logging.debug(f'Ubicaciones en lista: {len(ubsl.index)}')
        self.ciudades = obras.drop_duplicates(subset='Ciudades_actual_id')
        logging.debug(f'Ciudades en obras:{len(self.ciudades.index)}')
        self.paises = obras.drop_duplicates(subset='Paises_actual_id')
        logging.debug(f'Paises en obras: {len(self.paises.index)}')

        # ## URLS
        self.baseurl = self.config['baseurl']
        #obra_simbolos_baseurl = f'{baseurl}items/obra_simbolos_lista'
        self.obras_url = f'{self.baseurl}items/obra'
        #simbolos_url = f'{baseurl}items/simbolos_lista'
        self.paises_url = f'{self.baseurl}items/paises_lista/'
        self.ciudades_url = f'{self.baseurl}items/ciudades_lista/'
        self.ubicaciones_url = f'{self.baseurl}items/ubicacion/'
        self.key = os.getenv('KEY')
        self.headers =  {'Authorization':f"Bearer {self.key}"}



# ## Iteración Ciudades País
# 
# Creación de relación entre ciudad y país. Hace una peticion a la API buscando una ciudad con el ```arca_id```.  Hace otra petición buscando el país usando su ```arca_id```. Si encuentra las dos, hace una peticion a la lista de ciudades, estableciendo su relación con el país.
# 

    def cargarCiudades(self):
        for index, row in self.ciudades.iterrows():
            obra_arcaID = row['arca_id']

            ciudad_actual = row['Ciudad Actual']
            ca_id = row['Ciudades_actual_id']
            #ciudad_anterior = ['Ciudades']
            pais_actual = row['Pais Actual']
            #pais actual id
            pa_id = row['Paises_actual_id']
            #pais endpoint
            pa_ep = f'{self.paises_url}?filter[arca_id][_eq]={pa_id}&limit=1'
            ca_ep = f'{self.ciudades_url}?filter[arca_id][_eq]={ca_id}&limit=1'

            #obtener pais de la api
            try:
                r_pais = requests.get(pa_ep)
                r_pais.raise_for_status()
            except requests.RequestException as err:
                logging.error(f'Error obteniendo pais: {pa_id}')
                # si se produce error, continua el siguiente registro
                continue
            
            logging.debug(f'econtrado pais: {pa_id}')

            #se obtienen los datos de la respuesta
            try:
                pais = r_pais.json()['data'][0]
            except IndexError as err:
                logging.error(f'Pais no encontrado:{pa_id}, error: {err}')
                continue

            #obtener ciudad de la api
            try:
                r_ciudad = requests.get(ca_ep)
                r_ciudad.raise_for_status()
            except requests.RequestException as err:
                logging.error(f'Error obteniendo ciudad: {ca_id}, error: {err}')
                # si se produce error, continua el siguiente registro
                continue
            
            logging.debug(f'econtrada ciudad: {ca_id}')

            #se obtienen los datos de la respuesta
            try:
                ciudad = r_ciudad.json()['data'][0]
            except IndexError as err:
                logging.error(f'Ciudad no encontrada: {ca_id}, error: {err}')
                continue
            
            # crear el objeto obra simbolo con los ids de los objetos viculados
            ciudad['pais'] = pais['id']
            
            # actualizar pais
            ciudad_id = ciudad['id']
            ciudad_ep = f'{self.ciudades_url}{ciudad_id}'
            try:
                r_ciudadup = requests.patch(ciudad_ep, json = ciudad, headers=self.headers)
                r_ciudadup.raise_for_status()
            except requests.RequestException as err:
                logging.error(f'Error actualizando ciudad: id:{ciudad_id}, arca_id:{ca_id}')
                continue

            ciudadup = r_ciudadup.json()['data']
            logging.debug('OK: Creada relacion ciudad pais')
            

# ## Iteración Ubicaciones
# 
# Creación de relación entre ubicación y país. Hace una peticion a la API buscando una ubicación con su ```arca_id```.  Hace otra petición buscando la ciudad usando su ```arca_id```. Si encuentra las dos, hace una peticion a la lista de ciudades, estableciendo su relación con el la ciudad.
# 
    def cargarUbicaciones(self):
        for index, row in self.ubicaciones.iterrows():
            obra_arcaID = row['arca_id']

            ciudad_actual = row['Ciudad Actual']
            ca_id = row['Ciudades_actual_id']
            #ciudad_anterior = ['Ciudades']
            ubi_actual = row['Pais Actual']
            #pais actual id
            ua_id = row['id_ubicacion']
            #pais endpoint
            ua_ep = f'{self.ubicaciones_url}?filter[arca_id][_eq]={ua_id}&limit=1'
            ca_ep = f'{self.ciudades_url}?filter[arca_id][_eq]={ca_id}&limit=1'

            #obtener pais de la api
            try:
                r_ubi = requests.get(ua_ep)
                r_ubi.raise_for_status()
                logging.debug(f"econtrada ubicacion: {ua_id}")
            except requests.RequestException as err:
                logging.error(f"Error obteniendo pais: {ua_id}, error: {err}")
                # si se produce error, continua el siguiente registro
                continue

            #se obtienen los datos de la respuesta
            try:
                ubicacion = r_ubi.json()['data'][0]
            except IndexError as err:
                logging.error(f"ubicacion no encontrada:{ua_id}, error: {err}")
                continue

            #obtener ciudad de la api
            try:
                r_ciudad = requests.get(ca_ep)
                r_ciudad.raise_for_status()
                logging.debug(f'econtrada ciudad: {ca_id}')
            except requests.RequestException as err:
                logging.error(f'Error obteniendo ciudad: {ca_id}, error: {err}')
                # si se produce error, continua el siguiente registro
                continue

            #se obtienen los datos de la respuesta
            try:
                ciudad = r_ciudad.json()['data'][0]
            except IndexError as err:
                logging.error(f'Ciudad no encontrada: {ca_id}')
                continue
            
            # crear el objeto obra simbolo con los ids de los objetos viculados
            ubicacion['ciudad'] = ciudad['id']
            
            # actualizar pais
            ubicacion_id = ubicacion['id']
            ubicacion_ep = f"{self.ubicaciones_url}, {ubicacion_id}"
            try:
                r_ubicacionup = requests.patch(ubicacion_ep, json = ubicacion, headers=self.headers)
                r_ubicacionup.raise_for_status()
            except requests.RequestException as err:
                logging.error(f'Error actualizando ubicacion: id:{ubicacion_id}, arca_id:{ca_id}, error: {err}')
                continue

            ubicacionup = r_ubicacionup.json()['data']
            logging.debug('Creada relacion ubicacion pais')
            


if __name__ == '__main__':
        ubicacion = Ubicacion()

        ubicacion.cargarCiudades()
        ubicacion.cargarUbicaciones()
        sys.exit(0)

