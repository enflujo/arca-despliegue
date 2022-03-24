# %%
import os
import datetime
import json
import logging
import numpy as np
import requests
import pandas as pd
from dotenv import load_dotenv

# %% [markdown]
# ## Config

# %%
load_dotenv()
listas = json.load(open('../config/listas_config.json'))
config = json.load(open('../config/config.json'))

dir_tablas = config['dir_tablas']
key = os.getenv('KEY')
baseurl = config['baseurl']

headers = {'Authorization':f'Bearer {key}'}
timestamp = datetime.datetime.now()

logging.basicConfig(level=logging.DEBUG, filename='../logs/listas.log', filemode='w')

totalrows = 0
cleanedrows = 0
procesed = 0

# %%
for lista in listas:
    nombre_tabla = lista['table']
    filename = f'{dir_tablas}{nombre_tabla}.csv'
    resource = lista['resource']
    fields = lista['fields']
    try:
        tabla = pd.read_csv(filename, dtype=str)
    except FileNotFoundError as e:
        logging.exception("Tabla no encontrada")
    totalrows = len(tabla.index)
    tabla = tabla.rename(columns=fields)
    tabla = tabla.dropna(how='all')
    tabla = tabla.fillna('')
    cleanedrows = len(tabla.index)
    #tb = tabla.sample(5)
    #print(tabla)
    logging.debug(f'Procesando tabla {filename} con {len(tabla.index)} filas \n')
    for index, row in tabla.iterrows():
        data = row.to_dict()
        arca_id = data['arca_id']
        logging.debug(f"-- procesando fila: {index} --")
        try:
            r = requests.post(f'{baseurl}items/{resource}', 
                            json=data,
                            headers = headers)
            r.raise_for_status()
        except requests.RequestException as e:
            logging.exception(f'error en POST a {resource}')

            continue

        logging.debug(f"-- fila {index} ok --")
        procesed = procesed + 1



logging.debug(f'procesed: {procesed}')
logging.debug(f'total rows: {totalrows}')



