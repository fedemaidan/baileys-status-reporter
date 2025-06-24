FROM node:20-bullseye

WORKDIR /app

# Copiamos los archivos de definición
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Puerto por defecto
ENV PORT=4000

# Comando para arrancar el server
CMD ["npm", "start"]
