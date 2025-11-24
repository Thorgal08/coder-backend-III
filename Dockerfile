# imagen base de node
FROM node:18-alpine

# directorio de trabajo en el contenedor
WORKDIR /app

# copiar archivos de dependencias
COPY package*.json ./

# instalar dependencias
RUN npm install

# copiar todo el codigo fuente
COPY . .

# exponer el puerto que usa la aplicacion
EXPOSE 8080

# comando para iniciar la app
CMD ["npm", "start"]
