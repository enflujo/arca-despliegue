# Despliegue Arca

## Intro

Conjunto de herramientas para cargar datos en la base de datos del proyecto Arca. Los siguientes son los directorios y sus funciones:

```cargador/```: Contiene los scripts de carga.  Se pueden ejecutar individualmente o en conjunto, ejecutando el script ```cargar.py```.

```config/```: Archivos de configuración.  Son archivos json para configurar la aplicación.

```datos/```: Tablas con los datos que se van a cargar en la aplicación.  En ```entrada/csv``` van las tablas csv exportadas del excel de Arca.  En ```entrada/xslx``` va el excel completo. En ```salida``` van las tablas exportadas del directus de arca. Estas tablas sirven para reanudar cargas parciales cuando se caen o hay que pararlas en algún momento.

```esquemas/```: Esquemas exportados de directus. Contiene la estructura de las tablas.  Debe ser cargada en directus antes de ejecutar los scripts de carga.

```imgs/```: Directorio para las imágenes de arca que se deben cargar en el cms.  Se debe configurar en ```config.files_dir``` si se quieren cargar imágenes.

```logs/```: El directorio y su contenido es ignorado por git, por lo que hay que crearlo antes de ejecutar el script.  Aquí se guardan los logs generados por los scripts de carga.    Cada ejecución genera su log.

```notebooks/```:Versión de los scripts en notebooks interactivos de jupyter.  Se pueden usar para realizar una carga interactiva de los datos.

## Uso

Clonar el repositorio y entrar en el repo y crear el directorio ```logs/```/cargador.

```
git clone git@github.com:enflujo/despliegue-arca.git
cd despliegue-arca
mkdir logs
``` 
### Crear entorno e instalar dependencias

Se recomienda crear un entorno virtual de python 3 con ```virtualenvwrapper``` o ```conda```.  En este ejemplo usamos ```conda```.

```conda create -n arca python=3.9```
y 
```conda activate arca```

Instalar dependencias

```pip install -r requirements.txt```

### Crear archivo de entorno

Crear un archivo ```.env``` con la llave del API (si aplica):


```echo "KEY=LaLlaveDelApi" > .env```
### Cargar esquema

Copiar el archivo YAML del esquema del directorio ```esquema``` a la carpeta compartida con la imagen de docker de directus.

Conectarse a la imagen de directus: ```docker exec -it <containerID> /bin/sh```.

Aplicar el esquema o snapshot: ```npx directus schema apply ./path/to/snapshot.yaml```

### Ejecutar

Entrar en el directorio de scripts y ejecutar

```
cd cargador
python cargar.py
```
## Notas

- Durante la configuración, desactivar cache (Redis) en docker-compose para que las respuestas del API estén inmediatamente actualizadas durante despliegue.
- Definir "Transformation Presets" en "Project Settings" para limitar las posibles transformaciones de las imágenes (asumo que si se deja libre puede saturar de copias en el servidor).
- ¿Qué significa "ca" y "sf" en fechas de autores?.
