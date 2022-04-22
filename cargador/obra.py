#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import logging
import datetime
import json
import numpy as np
import requests
import pandas as pd
from dotenv import load_dotenv
# ## Preparación
# 
# En esta celda se cargan las columnas a usar de la tabla CSV exportada de la hoja de cálculo
# 
# Los nombres de las columnas se renombran para que coincidan con los nombres de los endpoints del API de Directus
# 
# Se establece la base de la url del API. Si cambia la URL del API, cambiar la variable ```base_url```
class Obra:
    def __init__(self):
        load_dotenv()
        self.config = json.load(open('../config/config.json'))

        #archivo = config['xlsx']
        self.archivo = self.config['csv']
        self.key = os.getenv('KEY')
        self.filesdir = self.config['files_dir']
        self.headers =  {'Authorization': f"Bearer {self.key}"}
        self.rename_dict = self.config['fields_map']
        self.field_names = list(self.rename_dict.values())

        self.baseurl = self.config['baseurl']

        self.obra_endpoint = 'items/obra/'
        #campos many to one
        self.m2o = self.config['m2o_map']

        #campos manty to many
        self.m2m = self.config['m2m_map']

        self.upload_files = False

        self.timestamp = datetime.datetime.now()

        logging.basicConfig(level=logging.DEBUG, 
            filename=f'../logs/obras-{self.timestamp.isoformat()}.log', 
            filemode='w'
        )
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))


        if self.config['filtro']:
            self.excluir = pd.read_csv('../datos/salida/obras.csv', dtype=str)
            self.excluir
        else:
            self.excluir = False


        #df = pd.read_excel(archivo, dtype=object, sheet_name='Registro general' )
        #df = pd.read_csv('arca_actualizada_RG.csv', dtype=str, usecols=colnames)
        df = pd.read_csv(self.archivo, dtype=str)

        logging.debug(f'-- Filas cargadas: {len(df.index)}')
        df = df.rename(columns=self.rename_dict)

        #eliminar filas vacias
        df = df.dropna(how='all')
        #eliminar filas sin id

        df = df.dropna(subset=['arca_id'])
        #rellenar NaNs
        df = df.fillna('')

        logging.debug(f'filas después de limpiar:{len(df.index)}')

        self.obra = df

        #print(len(excluir.index))# Filtrar los items ya subidos
        if self.excluir:
            filtrados = df.loc[~df['arca_id'].isin(self.excluir['arca_id'].tolist())]
            print(f'-- Items despues de filtar:{len(filtrados.index)}')
            #filtrados = df[18736:]
            self.obra = filtrados


    def cargar(self):

    # ## Iteración

        for index, row in self.obra.iterrows():

            data = row.to_dict()
            #get obra data from table
            #este objeto va a ser posteado al api
            obra = row[self.field_names]
            obra = obra.to_dict()
            obra['arca_id'] = int(obra['arca_id'])
            arca_id = int(float(data['arca_id']))
            logging.debug(f"Procesando obra: {arca_id}")
            
            #get m2o objects and append
            for m2ofield in self.m2o:
                #columna con el id del campo relacionado
                idcol = m2ofield['arca_id']
                #obtener el id del campo, convertir a float e int
                try:
                    resid = int(float(data[idcol]))
                except KeyError as e:
                    logging.error(f"Columna {idcol} no encontrada: {e}. Revisar nombres de columnas en tabla: {self.archivo}")
                    #Error grave, salimos del programa
                    sys.exit(1)
                except ValueError as e:
                    logging.error(f"Problema con la columna: {idcol}, valor{data[idcol]}")
                    sys.exit(1)

                #nombre del recurso a relacionar
                resourcename = m2ofield['resource']
                resourceurl = f"{self.baseurl}items/{resourcename}/?filter[arca_id][_eq]={resid}&limit=1"
                #print(resourceurl)
                try:
                    response = requests.get(resourceurl)
                    response.raise_for_status()

                except requests.RequestException as e:
                    logging.error(f'-- Error m2o GET related: {resourcename}--')
                    continue

                logging.debug(f"-- OK GET {resourcename}--")

                #se saca el objeto de la respuesta
                try:
                    object = response.json()['data'][0]
                #si no existe, continua a la siguiente iteracion
                except IndexError:
                    logging.error(f'-- Resultado vacío {resourceurl}--')
                    continue
                
                obra[m2ofield['field']] = object
                    
            # post obra
            # peticion para crear la obra
            try:
                r = requests.post(f'{self.baseurl}items/obra/', 
                            json=obra,
                            headers = self.headers)
                r.raise_for_status()

            except requests.RequestException as e:
                logging.error(f"-- Error POST Obra: {arca_id}: {e}") 
                continue

            logging.debug(f'-- OK POST Obra {r.status_code}--')
            #print(r.json())
            new_obra = r.json()['data']

            for m2mfield in self.m2m:
                resourcename = m2mfield['resource']
                for obj in m2mfield['objects']:
                    idcol = obj['arca_id']
                    resid = data[idcol]
                    #si existe id
                    if resid:
                        resid = int(float(resid))
                        resourceurl = f'{self.baseurl}items/{resourcename}/?filter[arca_id][_eq]={resid}&limit=1'
                        #print(resourceurl)

                        try:
                            rel_res = requests.get(resourceurl)
                            rel_res.raise_for_status()

                        except requests.RequestException as e:
                            logging.debug(f"-- Error m2m GET  related {resourcename}: error: {e}")
                            continue

                        logging.debug(f'-- OK GET {resourcename}--')

                        try:
                            related = rel_res.json()['data'][0]
                        except IndexError:
                            logging.debug(f'-- Resultado vacío {resourceurl}--')
                            continue
                        
                        # Create relationship
                        relation = {}
                        relation['obra_id'] = new_obra['id']
                        extfieldname = f'{resourcename}_id'
                        #print(related['id'])
                        relation[extfieldname] = related['id']
                        #print(relation)
                        # post relationship
                        m2mresname = m2mfield['m2mresource']
                        m2mresurl = f'{self.baseurl}items/{m2mresname}'

                        try:
                            m2mresp = requests.post(m2mresurl, json=relation, headers=self.headers)
                            m2mresp.raise_for_status()
                            
                        except requests.RequestException as e:
                            logging.error(f'-- Error m2m POST relation {m2mresname}')
                            continue

                        logging.debug(f'-- OK POST relation {m2mresname} --')
                        print(f'OK CREACION OBRA: {arca_id}')

                    #column is empty, continue
                    else:
                        continue

            
            if self.upload_files:     
                # Crear archivo de url
                # Formatear id para 4 digitos
                idfmt = '{:04d}'.format(arca_id)
                #nombre de archivo
                filename = f'{idfmt}.jpg'
                filepath = self.filesdir + filename

                with open(filepath, 'rb') as infile:    
                    print('open file')
                    file = {
                        'file': (filename,infile,'image/jpeg'),
                    }
                    
                    files_endpoint = f'{self.baseurl}files'
                    try:
                        res_file = requests.post(files_endpoint, headers = self.headers, files=file)
                        res_file.raise_for_status()
                    except requests.RequestException as e:
                        logging.error(f"-- Error file POST: {arca_id}--")
                        continue

                    logging.debug(f"-- OK POST File: {arca_id}")
                    nfile = res_file.json()['data']
                    nfileid = nfile['id']
                    obraid = new_obra['id']
                    obraurl = f'{self.baseurl}items/obra/{obraid}'
                    data = {
                        'imagen':nfileid
                    }
                    try:
                        updateres = requests.patch(obraurl, headers=self.headers, json=data)
                        updateres.raise_for_status()

                    except requests.RequestException as e:
                        print(f'-- Error UPDATE imagen-obra {arca_id}')
                        continue

                    print(f'-- OK UPDATE imagen-obra {arca_id}')


if __name__ == '__main__':
    obra = Obra()
    obra.cargar()
    sys.exit(0)