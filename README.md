# AdoptMe API - Sistema de Adopción de Mascotas

Proyecto final de Backend III para Coderhouse. API para gestionar adopciones de mascotas con Node.js y Express.

## 🎯 Entrega Final - Dockerización del Proyecto

Este proyecto cumple con los siguientes requisitos de la entrega:

### ✅ Requisitos Completados:

1. **Documentación con Swagger del módulo Users**
   - Disponible en: http://localhost:8080/api-docs
   - Documenta endpoints de mocking con Faker.js

2. **Tests funcionales para adoption.router.js**
   - Ubicación: `test/adoption.test.js` y `test/sessions.test.js`
   - Ejecutar con: `npm test`

3. **Dockerfile para generar imagen**
   - Archivo: `Dockerfile` en la raíz del proyecto
   - Construir con: `docker build -t adoptme-api .`

4. **Imagen subida a DockerHub**
   - **Link:** https://hub.docker.com/r/thorgal08/adoptme-api
   - **Comando:** `docker pull thorgal08/adoptme-api:latest`

## Descripción

Este proyecto permite gestionar usuarios, mascotas y adopciones. Incluye generación de datos de prueba con Faker.js, documentación con Swagger y Docker para facilitar el deploy.

## Características

- CRUD completo de usuarios, mascotas y adopciones
- Autenticación y manejo de sesiones
- Generación de datos mock con Faker.js
- Documentación API con Swagger
- Tests funcionales con Mocha y Chai
- Dockerizado y listo para deploy

## Tecnologías

- **Node.js** v18+
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **Swagger** - Documentación API
- **Mocha/Chai** - Testing
- **Faker.js** - Generación de datos
- **Docker** - Contenedorización

## Instalación Local

### Prerrequisitos

- Node.js v18 o superior
- MongoDB instalado y corriendo
- npm o yarn

### Pasos

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd proyecto-adoptme-backend-III
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar MongoDB:
   - Asegurarse que MongoDB esté corriendo en `localhost:27017`
   - Descomentar la línea de conexión en `src/app.js`:
```javascript
const connection = mongoose.connect(`mongodb://localhost:27017/db_example?directConnection=true`)
```

4. Iniciar la aplicación:
```bash
npm start
```

5. Para modo desarrollo:
```bash
npm run dev
```

La API estará disponible en `http://localhost:8080`

## 🚀 Inicio Rápido para el Profesor

Para probar el proyecto de forma inmediata usando Docker:

```bash
# 1. Descargar la imagen desde DockerHub
docker pull thorgal08/adoptme-api:latest

# 2. Ejecutar el contenedor
docker run -p 8080:8080 thorgal08/adoptme-api:latest

# 3. Acceder a la aplicación
# - Página principal: http://localhost:8080
# - Documentación Swagger: http://localhost:8080/api-docs
```

### Endpoints de prueba (Faker.js):
- **GET** http://localhost:8080/api/mocks/mockingpets - Genera 100 mascotas
- **GET** http://localhost:8080/api/mocks/mockingusers - Genera 50 usuarios

**Nota:** El proyecto funciona sin necesidad de MongoDB, usando datos generados con Faker.js.

---

## Uso con Docker

### Imagen en DockerHub

La imagen del proyecto está disponible en DockerHub:

**https://hub.docker.com/r/thorgal08/adoptme-api**

### Ejecutar con Docker

1. Pull de la imagen:
```bash
docker pull thorgal08/adoptme-api:latest
```

2. Ejecutar el contenedor:
```bash
docker run -p 8080:8080 thorgal08/adoptme-api:latest
```

### Construir la imagen localmente

```bash
docker build -t adoptme-api .
```

### Ejecutar el contenedor local

```bash
docker run -p 8080:8080 adoptme-api
```

### Docker Compose (Opcional)

Para ejecutar la app con MongoDB:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://mongodb:27017/db_example

volumes:
  mongo-data:
```

## Documentación API

Una vez iniciada la aplicación, acceder a la documentación interactiva de Swagger en:

```
http://localhost:8080/api-docs
```

## Endpoints Principales

### Users
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:uid` - Obtener usuario por ID
- `PUT /api/users/:uid` - Actualizar usuario
- `DELETE /api/users/:uid` - Eliminar usuario

### Pets
- `GET /api/pets` - Obtener todas las mascotas
- `GET /api/pets/:pid` - Obtener mascota por ID
- `POST /api/pets` - Crear nueva mascota
- `PUT /api/pets/:pid` - Actualizar mascota
- `DELETE /api/pets/:pid` - Eliminar mascota
- `POST /api/pets/withimage` - Crear mascota con imagen

### Adoptions
- `GET /api/adoptions` - Obtener todas las adopciones
- `GET /api/adoptions/:aid` - Obtener adopción por ID
- `POST /api/adoptions/:uid/:pid` - Crear nueva adopción

### Mocks
- `GET /api/mocks/mockingpets` - Generar 100 mascotas de prueba
- `GET /api/mocks/mockingusers` - Generar 50 usuarios de prueba
- `POST /api/mocks/generateData` - Insertar datos en la BD

Ejemplo de body para `generateData`:
```json
{
  "users": 10,
  "pets": 20
}
```

## Tests

### Ejecutar Tests Funcionales

```bash
npm test
```

### Tests Implementados:

#### 1. Tests de Adoptions (`test/adoption.test.js`)
Cubre todos los endpoints del router `adoption.router.js`:
- ✅ GET /api/adoptions - Obtener todas las adopciones
- ✅ GET /api/adoptions/:aid - Obtener adopción por ID
- ✅ POST /api/adoptions/:uid/:pid - Crear nueva adopción
- ✅ Validaciones y manejo de errores (404, 400)
- ✅ Flujo completo de adopción

#### 2. Tests de Sessions (`test/sessions.test.js`)
Cubre endpoints de registro y login:
- ✅ POST /api/sessions/register - Registro de usuarios
- ✅ POST /api/sessions/login - Autenticación
- ✅ Validación de passwords hasheados (bcrypt)
- ✅ Manejo de cookies
- ✅ Actualización de last_connection
- ✅ Flujo completo registro + login

**Nota:** Los tests requieren MongoDB corriendo localmente. Los tests se conectan automáticamente a la base de datos de prueba.

## Estructura del Proyecto

```
proyecto-adoptme-backend-III/
├── src/
│   ├── app.js                 # Punto de entrada
│   ├── config/
│   │   └── swagger.config.js  # Configuración Swagger
│   ├── controllers/           # Controladores
│   ├── dao/                   # Data Access Objects
│   │   └── models/           # Modelos Mongoose
│   ├── dto/                   # Data Transfer Objects
│   ├── repository/            # Patrón Repository
│   ├── routes/                # Rutas API
│   ├── services/              # Servicios
│   └── utils/                 # Utilidades
├── test/
│   └── adoption.test.js       # Tests funcionales
├── Dockerfile                 # Configuración Docker
├── .dockerignore             # Archivos ignorados por Docker
├── package.json
└── README.md
```

## Variables de Entorno

El proyecto usa las siguientes variables (opcional):

- `PORT` - Puerto del servidor (default: 8080)
- `MONGO_URL` - URL de conexión a MongoDB

## Desarrollo

### Scripts disponibles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia en modo desarrollo con nodemon
- `npm test` - Ejecuta los tests

### Agregar nuevos endpoints

1. Crear el controlador en `src/controllers/`
2. Crear la ruta en `src/routes/`
3. Documentar con Swagger usando JSDoc
4. Agregar tests en `test/`

## Notas Importantes

- La conexión a MongoDB está comentada por defecto
- Para usar con BD, descomentar la línea de conexión en `src/app.js`
- Los passwords se hashean con bcrypt
- Las imágenes se guardan en `src/public/img/`
- El proyecto usa Faker.js para generar datos de prueba

## 📦 Links del Proyecto

- **Repositorio GitHub:** https://github.com/Thorgal08/coder-backend-III
- **Imagen DockerHub:** https://hub.docker.com/r/thorgal08/adoptme-api

## Autor

Proyecto para Coderhouse - Backend III

## Licencia

ISC
