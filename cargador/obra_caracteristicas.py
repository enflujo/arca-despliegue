#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# # Alimentador obra - características
# 
# Notebook para crear los símbolos y vincularlos a las obras.  Necesita dos tablas. Una que contiene los ids de las obras a crear y otra que contiene la relación de los símbolos y obras del excel de Arca
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
class obraCaracteristicas:
    def __init__(self):

        load_dotenv()
        self.config = json.load(open('../config/config.json'))

        caracts_tabla = '../datos/entrada/csv/Registros_caracteristicas_particulares_2.csv'


        df = pd.read_csv(caracts_tabla, dtype=str)
        df = df.dropna(how='all')
        df = df.dropna(subset=['id'])
        df['id'] = df['id'].astype(int)
        self.caracts = df.sort_values(by='id')

        filtrar = False

        self.timestamp = datetime.datetime.now()

        logging.basicConfig(level=logging.DEBUG, 
            filename=f'../logs/obra-caracteristicas-{self.timestamp.isoformat()}.log', 
            filemode='w'
        )
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

        if filtrar:
            obras_tabla = '../tablas/csv/obra-soluciones.csv'
            # dataframes de las tablas
            obras = pd.read_csv(obras_tabla, dtype=str)
            #filtrar los caracts por los ids de obras en arca
            caracts_filtrados = self.caracts.loc[self.caracts['artwork_id'].isin(obras['arca_id']).tolist()]

            self.caracts = caracts_filtrados

        # ## URLS
        self.baseurl = self.config['baseurl']
        self.obra_caracts_baseurl = f'{self.baseurl}items/obra_caracteristicas_particulares_lista'
        self.obras_url = f'{self.baseurl}items/obra'
        self.caracts_url = f'{self.baseurl}items/caracteristicas_particulares_lista'

        self.key = os.getenv('KEY')
        self.headers =  {'Authorization':f"Bearer {self.key}"}

    def cargar(self):
        # ## Iteración
        for index, row in self.caracts.iterrows():
            m2m_arcaid  = row['id']
            obra_arcaID = row['artwork_id']
            caract_arcaID = row['engraving_id']
            obra_url = f'{self.obras_url}?filter[arca_id][_eq]={obra_arcaID}&limit=1'
            sim_url = f'{self.caracts_url}?filter[arca_id][_eq]={caract_arcaID}&limit=1'

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
                logging.error(f"Busqueda vacia.. error: {e}")
                continue

            #obtener el caract de la api
            try: 
                r_sim = requests.get(sim_url)
                r_sim.raise_for_status()
            except requests.RequestException as err:
                print(f'Error obteniendo caract: {caract_arcaID}, error: {err}')
                continue

            #se obtienen los datos de la respuesta
            try:
                caract = r_sim.json()['data'][0]
                #print(caract)
            except IndexError as e:
                logging.error(f"Busqueda vacia error: {e}")
                continue

            # crear el objeto obra caract con los ids de los objetos viculados
            obra_sim = {}
            obra_sim['arca_id'] = m2m_arcaid 
            obra_sim['obra_id'] = obra['id']
            obra_sim['caracteristicas_particulares_lista_id'] = caract['id']
            
            # crear m2m obra caract
            try:
                r_obsim_m2m = requests.post(self.obra_caracts_baseurl, json = obra_sim, headers=self.headers)
                r_obsim_m2m.raise_for_status()
            except requests.RequestException as err:
                logging.error(f'Error creando m2m obra caract: {obra_sim}, error: {err}')
                continue

            obsim_m2m = r_obsim_m2m.json()['data']
            m2mid = obsim_m2m['id']
            logging.debug(f'Creada relacion obra caract: {m2mid} arcaid: {m2m_arcaid}')
            
obraCaracteristica = obraCaracteristicas()
obraCaracteristica.cargar()


