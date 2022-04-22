#!/usr/bin/env python3

import os
import sys
import datetime
import json
import logging
import numpy as np
import requests
import pandas as pd
from dotenv import load_dotenv

class Lista:
    def __init__(self):
        load_dotenv()
        self.listas = json.load(open('../config/listas_config.json'))
        self.config = json.load(open('../config/config.json'))

        self.dir_tablas = self.config['dir_tablas']
        self.key = os.getenv('KEY')
        self.baseurl = self.config['baseurl']

        self.headers = {'Authorization': f"Bearer {self.key}"}
        self.timestamp = datetime.datetime.now()

        logging.basicConfig(level=logging.DEBUG, 
            filename=f'../logs/listas-{self.timestamp.isoformat()}.log', 
            filemode='w'
        )
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

        self.totalrows = 0
        self.cleanedrows = 0
        self.procesed = 0

    def cargar(self):
        print("Iniciando script")
        for lista in self.listas:
            nombre_tabla = lista['table']
            filename = f'{self.dir_tablas}{nombre_tabla}.csv'
            resource = lista['resource']
            fields = lista['fields']
            try:
                tabla = pd.read_csv(filename, dtype=str)
            except FileNotFoundError as e:
                logging.exception("Tabla no encontrada")
            self.totalrows = len(tabla.index)
            tabla = tabla.rename(columns=fields)
            tabla = tabla.dropna(how='all')
            tabla = tabla.fillna('')
            logging.debug(f'Procesando tabla {filename} con {len(tabla.index)} filas \n')
            for index, row in tabla.iterrows():
                data = row.to_dict()
                arca_id = data['arca_id']
                logging.debug(f"-- procesando fila: {index} --")
                try:
                    r = requests.post(f'{self.baseurl}items/{resource}', 
                                    json=data,
                                    headers = self.headers)
                    r.raise_for_status()
                except requests.RequestException as e:
                    logging.exception(f'error en POST a {resource}')

                    continue

                logging.debug(f"-- fila {index} ok --")
                self.procesed = self.procesed + 1



        logging.debug(f'procesed: {self.procesed}')
        logging.debug(f'total rows: {self.totalrows}')


lista = Lista()
lista.cargar()


