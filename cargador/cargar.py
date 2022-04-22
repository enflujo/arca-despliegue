#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import listas
import obra
import ubicacion
import obra_caracteristicas
import obra_descriptores
import obra_simbolos


# Listas

lista = listas.Lista()
lista.cargar()

#Obras
obras = obra.Obra()
obras.cargar()

#Ubicaciones
ubicaciones = ubicacion.Ubicacion()
ubicaciones.cargarCiudades()
ubicaciones.cargarUbicaciones()

# Simbolos
simbolos = obra_simbolos.obraSimbolos()
simbolos.cargar()

#Descriptores
descriptores = obra_descriptores.obraDescriptores()
descriptores.cargar()

#Caracteristicas
caracteristicas = obra_caracteristicas.obraCaracteristicas()
caracteristicas.cargar()