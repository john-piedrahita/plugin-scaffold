# Clean Architecture Scaffold

Este CLI crea la estructura de un proyecto de NodeJs y TypeScript basado en arquitectura limpia para construir  API RESTful, viene con la configuración inicial de una aplicación de Express como framework de NodeJs y esta se encuentra en la **`capa de application`**.

- [Clean Architecture Scaffold](#clean-architecture-scaffold)
- [Implementación del plugin](#implementación-del-plugin)
- [Tareas](#tareas)
  - [Generar proyecto](#generar-proyecto)
  - [Generar Modelo](#generar-modelo)
  - [Generar Servicio](#generar-servicio)
  - [Generar Controlador](#generar-controlador)

# Implementación del plugin

Instalamos el plugin de forma global en nuestro equipo, para poder acceder a los comandos que generan
las tareas.

**`npm i -g clean-scaffold`**

# Tareas

## Generar proyecto

1. Generamos la estructura del proyecto con el comando **`scaffold init`**, el cual recibe dos parámetros
    **`--name`** y **`--express`**.

   - **`--name`** = Nombre del proyecto el cual especificas.

   - **`--express`** = Esta es una bandera que determina que es un proyecto   con el framework Express, debe de pasarse como **`true`**. En próximas versiones se podrá generar con otros framework de Nodejs.

   ```shell
   scaffold init --name=[nombre proyecto] --express true
   ```

**_Estructura que genera el plugin:_**

![](../plugin-scaffold/assets/estructura.png)

## Generar Modelo

1. El comando **`scaffold create:entity`** generará un modelo y una interfaz  en la **`capa del dominio [models]`**, esta tarea tiene como parámetro **`--name`** y este es requerido.

   - **`--name`** = Nombre del modelo.
    
   ```shell
   scaffold create:entity --name=[nombre del modelo]
   ```

**_Estructura que genera la tarea:_**

![](../plugin-scaffold/assets/models.png)

## Generar Servicio

1. El comando **`scaffold create:service`** generará la interfaz y el servicio que hace la implementación de esta en la 
   **`capa del dominio [use-cases]`**, esta tarea tiene como parámetro **`--name`** y este es requerido.

   - **`--name`** = Nombre del servicio.

   ```shell
   scaffold create:service --name=[nombre del servicio]
   ```

**_Estructura que genera la tarea:_**

![](../plugin-scaffold/assets/services.png)

## Generar Controlador

1. El comando **`scaffold create:controller`** generará un controlador en la **`capa de infrastructure`**, 
   esta tarea tiene como parámetro **`--name`** y este es requerido.

   - **`--name`** = Nombre del controlador.

   ```shell
   scaffold create:controller --name=[nombre del controlador]
   ```

**_Estructura que genera la tarea:_**

![](../plugin-scaffold/assets/controller.png)