# Despliegue Arca

Conjunto de herramientas para cargar datos en la base de datos del proyecto Arca.

## Crear archivo de entorno

Crear un archivo `.env` con la llave del API (si aplica):

`echo "KEY=LaLlaveDelApi" > .env`

### Cargar esquema

Copiar el archivo YAML del esquema del directorio `esquema` a la carpeta compartida con la imagen de docker de directus.

Conectarse a la imagen de directus: `docker exec -it <containerID> /bin/sh`.

Aplicar el esquema o snapshot: `npx directus schema apply ./path/to/snapshot.yaml`

## Notas

- Durante la configuración, desactivar cache (Redis) en docker-compose para que las respuestas del API estén inmediatamente actualizadas durante despliegue.
- Definir "Transformation Presets" en "Project Settings" para limitar las posibles transformaciones de las imágenes (asumo que si se deja libre puede saturar de copias en el servidor).

- Fechas actividad se refiere a la fecha de la obra?

### Relaciones

```mermaid
erDiagram
    obras {
      number id
      number user_created
      datetime date_created
      number user_updated
      datetime date_updated
      string estado
      number registro
      string titulo
      array autores
      object imagen
      number fuente
      string sintesis
      string comentario_bibliografico
      string iconotexto
      number categoria1
      number categoria2
      number categoria3
      number categoria4
      number categoria5
      number categoria6
      boolean fecha_periodo
      number fecha_inicial
      number fecha_final
      number donante
    }

    autores {
      number id
      string nombre
      string apellido
      number desde
      string desde_anotacion
      hasta hasta_anotacion
      string biografia
      string referencia
      array obras
    }

    imagen {
      number id
      string storage
      string filename_disk
      string filename_download
      string title
      string type
      number folder
      number uploaded_by
      datetime uploaded_on
      number modified_by
      number filesize
      number width
      number height
      number duration
      string description
      string location
      array tags
      object metadata
    }

    fuentes {
      number id
      string descripcion
      array obras
    }

    categorias1 {
      number id
      string nombre
      string slug
      string descripcion
      object imagen
      array categorias2
      array obras
    }

    categorias2 {
      number id
      string nombre
      string slug
      number ancestro
      string descripcion
      array categorias3
      array obras
    }

    categorias3 {
      string nombre
      string slug
      number ancestro
      string descripcion
      array categorias4
      array obras
    }

    categorias4 {
      string nombre
      string slug
      number ancestro
      string descripcion
      array categorias5
      array obras
    }

    categorias5 {
      string nombre
      string slug
      number ancestro
      string descripcion
      array categorias6
      array obras
    }

    categorias6 {
      string nombre
      string slug
      number ancestro
      string descripcion
      array obras
    }

    donantes {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    ciudades {
      number id
      string nombre
      number pais
      array ubicaciones
      array obras_origen
      array obras
    }

    ubicaciones {
      number id
      string nombre
      string anotacion
      Point geo
      number ciudad
      array obras
    }

    relatos_visuales {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    escenarios {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    objetos {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    tecnicas {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    tipos_gestuales {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    complejos_gestuales {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    gestos {
      number id
      string codigo
      string nombre
      string slug
      string descripcion
      array obras
    }

    fisiognomicas {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    fisiognomicas_imagen {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    cartelas_filacterias {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    rostros {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    personajes {
      number id
      string nombre
      string slug
      string descripcion
      string fuente
      number muerte
      sring muerte_anotacion
      number beatificacion_canonizacion_desde
      string beatificacion_canonizacion_desde_anotacion
      number beatificacion_canonizacion_hasta
      string beatificacion_canonizacion_hasta_anotacion
      array obras
    }

    simbolos {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    descriptores {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    caracteristicas {
      number id
      string nombre
      string slug
      string descripcion
      array obras
    }

    paises {
      number id
      string nombre
      string slug
      Geometry geo
      array ciudades
      array obras
    }

    obras }o--o{ autores : M2M_autores
    obras }o--o| imagen : M2O_imagen
    obras }o--o| fuentes : M2O_fuente
    obras }o--o| categorias1: M2O_categoria1
    obras }o--o| categorias2: M2O_categoria2
    obras }o--o| categorias3: M2O_categoria3
    obras }o--o| categorias4: M2O_categoria4
    obras }o--o| categorias5: M2O_categoria5
    obras }o--o| categorias6: M2O_categoria6
    obras }o--o| donante : M2O_donante
    obras }o--o| ciudades : M2O_ciudad_origen
    obras }o--o| ubicaciones : M2O_ubicacion
    obras }o--o| relatos_visuales : M2O_relato_visual
    obras }o--o{ escenarios : M2M_escenarios
    obras }o--o{ objetos : M2M_objetos
    obras }o--o{ tecnicas : M2M_tecnicas
    obras }o--o| tipos_gestuales : M2O_tipo_gestual
    obras }o--o| complejos_gestuales : M2O_complejo_gestual
    obras }o--o{ gestos : M2M_gestos
    obras }o--o| fisiognomicas : M2O_fisiognomica
    obras }o--o| fisiognomicas_imagen : M2O_fisiognomica_imagen
    obras }o--o| cartelas_filacterias : M2O_cartela_filacteria
    obras }o--o| rostros : M2O_rostro
    obras }o--o{ personajes : M2M_personaje
    obras }o--o{ simbolos : M2M_simbolos
    obras }o--o{ descriptores : M2M_descriptores
    obras }o--o{ caracteristicas : M2M_caracteristicas
    obras }o--o| ciudades : M2O_ciudad
    obras }o--o| paises : M2O_pais

    autores }o--o{ obras : M2M
    fuentes |o--o{ obras : O2M

    categorias1 }o--o| imagen: M2O
    categorias1 |o--o{ categorias2 : O2M
    categorias1 |o--o{ obras : O2M

    categorias2 }o--o| imagen: M2O
    categorias2 }o--o| categorias1: M2O_ancestro
    categorias2 |o--o{ categorias3 : O2M
    categorias2 |o--o{ obras : O2M

    categorias3 }o--o| imagen: M2O
    categorias3 }o--o| categorias2: M2O_ancestro
    categorias3 |o--o{ categorias4 : O2M
    categorias3 |o--o{ obras : O2M

    categorias4 }o--o| imagen: M2O
    categorias4 }o--o| categorias3: M2O_ancestro
    categorias4 |o--o{ categorias5 : O2M
    categorias4 |o--o{ obras : O2M

    categorias5 }o--o| imagen: M2O
    categorias5 }o--o| categorias4: M2O_ancestro
    categorias5 |o--o{ categorias6 : O2M
    categorias5 |o--o{ obras : O2M

    categorias6 }o--o| imagen: M2O
    categorias6 }o--o| categorias5: M2O_ancestro
    categorias6 |o--o{ obras : O2M

    donante |o--o{ obras : O2M

    ciudades }o--o| paises : M2O_pais
    ciudades |o--o{ ubicaciones : O2M
    ciudades |o--o{ obras : O2M_obras_origen
    ciudades |o--o{ obras : O2M

    ubicaciones }o--o| ciudades : M2O_ciudad
    ubicaciones |o--o{ obras : O2M

    relatos_visuales |o--o{ obras : O2M
    escenarios }o--o{ obras : M2M
    objetos }o--o{ obras : M2M
    tecnicas }o--o{ obras : M2M
    tipos_gestuales |o--o{ obras : O2M
    complejos_gestuales |o--o{ obras : O2M
    gestos }o--o{ obras : M2M
    fisiognomicas |o--o{ obras : O2M
    fisiognomicas_imagen |o--o{ obras : O2M
    cartelas_filacterias |o--o{ obras : O2M
    rostros |o--o{ obras : O2M
    personajes }o--o{ obras : M2M
    simbolos }o--o{ obras : M2M
    descriptores }o--o{ obras : M2M
    caracteristicas }o--o{ obras : M2M

    paises |o--o{ ciudades : O2M
    rostros |o--o{ obras : O2M
```
