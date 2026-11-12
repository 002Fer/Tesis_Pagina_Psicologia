# Imagen base oficial de Node.js (Alpine para menor tamaño y seguridad)
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar manifiestos de paquetes
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el resto del código del backend
COPY . .

# Puerto expuesto en la red interna de Docker
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000

# Usuario no privilegiado
USER node

# Comando de arranque
CMD ["node", "server.js"]
