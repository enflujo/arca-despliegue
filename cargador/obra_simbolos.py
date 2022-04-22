#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# # Alimentador obra - símbolos
# 
# Notebook para crear los símbolos y vincularlos a las obras.  Necesita dos tablas. Una que contiene los ids de las obras a crear y otra que contiene la relación de los símbolos y obras del excel de Arca

import os
import sys
import logging
import datetime
import json
import numpy as np
import requests
import pandas as pd
from dotenv import load_dotenv

class obraSimbolos:
    def __init__(self):
        load_dotenv()
        self.config = json.load(open('../config/config.json'))
        simbolos_tabla = '../datos/entrada/csv/Simbolos_2_registros.csv'
        df = pd.read_csv(simbolos_tabla, dtype=str)
        df = df.dropna(how='all')
        df = df.dropna(subset=['id'])
        df['id'] = df['id'].astype(int)
        df = df.sort_values(by='id')
        self.simbolos = df

        self.timestamp = datetime.datetime.now()

        logging.basicConfig(level=logging.DEBUG, 
            filename=f'../logs/obra-simbolos-{self.timestamp.isoformat()}.log', 
            filemode='w'
        )
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

        filtrar = False

        if filtrar:
            obras_tabla = '../datos/salida/obra.csv'

            # dataframes de las tablas
            obras = pd.read_csv(obras_tabla, dtype=str)
            #filtrar los simbolos por los ids de obras en arca
            simbolos_filtrados = simbolos.loc[simbolos['artwork_id'].isin(obras['arca_id']).tolist()]
            simbolos = simbolos_filtrados

        # ## URLS

        #baseurl = 'http://localhost:8055/'
        self.baseurl = self.config['baseurl']
        self.obra_simbolos_baseurl = f'{self.baseurl}items/obra_simbolos_lista'
        self.obras_url = f'{self.baseurl}items/obra'
        self.simbolos_url = f'{self.baseurl}items/simbolos_lista'

        self.key = os.getenv('KEY')
        self.headers =  {'Authorization':f"Bearer {self.key}"}



# ## Cargar datos

    def cargar(self):

        for index, row in self.simbolos.iterrows():
            m2m_arcaid  = row['id']
            obra_arcaID = row['artwork_id']
            simbolo_arcaID = row['artwork_symbol_id']
            obra_url = f'{self.obras_url}?filter[arca_id][_eq]={obra_arcaID}&limit=1'
            sim_url = f'{self.simbolos_url}?filter[arca_id][_eq]={simbolo_arcaID}&limit=1'


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
                logging.error(f"Error obteniendo obra: {obra_arcaID}, error {e}")
                continue

            #obtener el simbolo de la api
            try: 
                r_sim = requests.get(sim_url)
                r_sim.raise_for_status()
                logging.debug(f'econtrado símbolo: {simbolo_arcaID}')

            except requests.RequestException as err:
                logging.error(f"Error obteniendo simbolo: {simbolo_arcaID}, error: {err}")
                continue

            #se obtienen los datos de la respuesta
            try:
                simbolo = r_sim.json()['data'][0]
            except IndexError as e:
                logging.error(f'Error obteniendo símbolo: {simbolo_arcaID}, error: {e}')
                continue

            # crear el objeto obra simbolo con los ids de los objetos viculados
            obra_sim = {}
            obra_sim['arca_id'] = m2m_arcaid 
            obra_sim['obra_id'] = obra['id']
            obra_sim['simbolos_lista_id'] = simbolo['id']
            
            # crear m2m obra simbolo
            try:
                r_obsim_m2m = requests.post(self.obra_simbolos_baseurl, json = obra_sim, headers=self.headers)
                r_obsim_m2m.raise_for_status()
            except requests.RequestException as err:
                logging.error(f'Error creando m2m obra simbolo: {obra_sim}, error: {err}')
                continue

            obsim_m2m = r_obsim_m2m.json()['data']
            m2mid = obsim_m2m['id']
            logging.debug(f'Creada relacion obra simbolo: {m2mid} arcaid: {m2m_arcaid}')
            

obraSimbolo = obraSimbolos()
obraSimbolo.cargar()
