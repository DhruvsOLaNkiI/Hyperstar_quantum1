FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy all application files
COPY . .

# Expose server port
EXPOSE 3000

# Start Express & MongoDB server
CMD ["node", "server.js"]
