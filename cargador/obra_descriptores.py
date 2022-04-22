#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# # Alimentador descriptores de obra
# 
# Notebook para crear los descriptores y vincularlos a las obras.  Necesita dos tablas. Una que contiene los ids de las obras a crear y otra que contiene la relación de los descriptores y obras del excel de Arca

import os
import sys
import datetime
import logging
import json
import numpy as np
import requests
import pandas as pd
from dotenv import load_dotenv


class obraDescriptores:
# ## Abrir tablas y filtrar datos
    def __init__(self):
                
        load_dotenv()
        #carga la configuracion
        self.config = json.load(open('../config/config.json'))

        descriptores_tabla = '../datos/entrada/csv/Descriptores_registros_1.csv'


        df = pd.read_csv(descriptores_tabla, dtype=str)

        df = df.dropna(how='all')
        df = df.sort_values(by='id')
        self.descriptores = df

        filtrar = False
        
        self.timestamp = datetime.datetime.now()

        logging.basicConfig(level=logging.DEBUG, 
            filename=f'../logs/obra-descriptores-{self.timestamp.isoformat()}.log', 
            filemode='w'
        )
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

        if filtrar:
            obras_tabla = '../tablas/csv/obra-soluciones.csv'
            # dataframes de las tablas
            obras = pd.read_csv(obras_tabla, dtype=str)
            #filtrar los descriptores por los ids de obras en arca
            descriptores_filtrados = self.descriptores.loc[self.descriptores['artwork_id'].isin(obras['arca_id']).tolist()]

            #muestra para prueba
            #descriptores_filtrados = descriptores_filtrados.sample(1)
            #descriptores_filtrados
            self.discriptores = descriptores_filtrados

        # ## URLS

        #baseurl = 'http://localhost:8055/'
        baseurl = self.config['baseurl']
        self.obra_descriptor_baseurl = f'{baseurl}items/obra_descriptores_lista'
        self.obras_url = f'{baseurl}items/obra'
        self.descriptores_url = f'{baseurl}items/descriptores_lista'

        self.key = os.getenv('KEY')
        self.headers =  {'Authorization':f"Bearer {self.key}"}
    
    # ## Iteración
    def cargar(self):
        for index, row in self.descriptores.iterrows():
            obra_arcaID = row['artwork_id']
            descriptor_arcaID = row['description_id']
            obra_url = f'{self.obras_url}?filter[arca_id][_eq]={obra_arcaID}&limit=1'
            desc_url = f'{self.descriptores_url}?filter[arca_id][_eq]={descriptor_arcaID}&limit=1'
            m2m_arcaid = row['id']
            #obra = {}
            #descriptor = {}

            #obtener la obra de la api
            try:
                r_obra = requests.get(obra_url)
                r_obra.raise_for_status()
                logging.debug(f'econtrada obra: {obra_arcaID}')
            except requests.RequestException as err:
                logging.error(f'Error obteniendo obra: {obra_arcaID}, error: {err}')
                # si se produce error, continua el siguiente registro
                continue

            #se obtienen los datos de la respuesta
            try:
                obra = r_obra.json()['data'][0]
            except IndexError as e:
                logging.error(f"Error obteniendo obra: {obra_arcaID}, error: {e}")
                continue
            #obtener el descriptor de la api

            try: 
                r_desc = requests.get(desc_url)
                r_desc.raise_for_status()
            except requests.RequestException as err:
                logging.error(f'Error obteniendo descripcion: {descriptor_arcaID}, error: {err}')
                continue

            #se obtienen los datos de la respuesta
            try:
                descriptor = r_desc.json()['data'][0]
            except IndexError as e:
                logging.error(f"Error obteniendo descriptor: {e}")
                continue

            # crear el objeto obra descriptor con los ids de los objetos viculados
            obra_desc = {}
            obra_desc['obra_id'] = obra['id']
            obra_desc['descriptores_lista_id'] = descriptor['id']
            
            # crear m2m obra descriptor
            try:
                r_obdesc_m2m = requests.post(self.obra_descriptor_baseurl, 
                    json = obra_desc,
                    headers=self.headers
                )
                r_obdesc_m2m.raise_for_status()
            except requests.RequestException as err:
                logging.error(f"Error creando m2m obra desctripcion: {obra_desc}, error: {err}")
                continue

            obdesc_m2m = r_obdesc_m2m.json()['data']
            m2mid = obdesc_m2m['id'] 
            logging.debug(f'Creada relacion obra descriptor: {m2mid} arcaid: {m2m_arcaid}')

if __name__ == '__main__':
    obraDescriptor = obraDescriptores()
    obraDescriptor.cargar()
    sys.exit(0)
