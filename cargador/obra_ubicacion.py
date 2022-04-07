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

class obraUbicacion:
    def __init__(self):

        load_dotenv()
        self.key = os.getenv('KEY')
        self.config = json.load(open('../config/config.json'))

        filtrar = False

        if filtrar:
            obras_arriba = '../datos/salida/obra.csv'
            obras_abajo = self.config['csv']


            # dataframes de las tablas
            obras_a = pd.read_csv(obras_arriba, dtype=str)
            obras_b = pd.read_csv(obras_abajo, dtype=str)

            #filtrar los simbolos por los ids de obras en arca
            obras_filtradas = obras_b.loc[obras_b['t'].isin(obras_a['arca_id']).tolist()]

            #muestra para prueba
            #simbolos_filtrados = simbolos_filtrados.sample(1)
            #len(simbolos_filtrados.index)
            self.obras = obras_filtradas

        else:
            self.obras = pd.read_csv(config['csv'], dtype=str)

        self.obras.dropna(how='all')

        # ## URLS
        self.baseurl = config['baseurl']
        #obra_simbolos_baseurl = f'{baseurl}items/obra_simbolos_lista'
        self.obras_url = f'{baseurl}items/obra'
        #simbolos_url = f'{baseurl}items/simbolos_lista'

        self.headers =  {'Authorization':f"Bearer {self.key}"}

        self.timestamp = datetime.datetime.now()

        logging.basicConfig(level=logging.DEBUG, 
            filename=f'../logs/obra-ubicacion-{self.timestamp.isoformat()}.log', 
            filemode='w'
        )
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))


# ## Iteración
        def cargar(self):
            for index, row in self.obras.iterrows():
                obra_arcaID = row['artwork_id']

                ciudad_actual = row['Ciudad Actual']
                ciudad_anterior = row['Ciudades']
                #pais_actual
                #pais_anterior
                #simbolo_arcaID = row['artwork_symbol_id']
                obra_url = f'{self.obras_url}?filter[arca_id][_eq]={obra_arcaID}&limit=1'
                #sim_url = f'{simbolos_url}?filter[arca_id][_eq]={simbolo_arcaID}&limit=1'
                #obra = {}
                #simbolo = {}

                #obtener la obra de la api
                try:
                    r_obra = requests.get(obra_url)
                    r_obra.raise_for_status()
                    logging.debug(f'econtrada obra: {obra_arcaID}')
                except requests.RequestException as err:
                    logging.error(f"Error obteniendo obra: {obra_arcaID}, error: {err}")
                    # si se produce error, continua el siguiente registro
                    continue

                #se obtienen los datos de la respuesta
                try:
                    obra = r_obra.json()['data'][0]
                except IndexError as err:
                    logging.error(f"Error obteniendo obra:{obra_arcaID}")
                    continue

                #se obtienen los datos de la respuesta
                simbolo = r_sim.json()['data'][0]
                print(simbolo)

                # crear el objeto obra simbolo con los ids de los objetos viculados
                obra_sim = {}
                obra_sim['obra_id'] = obra['id']
                obra_sim['simbolos_lista_id'] = simbolo['id']
                
                # crear m2m obra simbolo
                try:
                    r_obsim_m2m = requests.post(obra_simbolos_baseurl, json = obra_sim, headers=headers)
                    r_obsim_m2m.raise_for_status()
                except requests.RequestException as err:
                    print(f'Error creando m2m obra simbolo: {obra_sim}')
                    print(err)
                    continue

                obsim_m2m = r_obsim_m2m.json()['data']
                print('Creada relacion obra simbolo')
                print(obsim_m2m)
                


