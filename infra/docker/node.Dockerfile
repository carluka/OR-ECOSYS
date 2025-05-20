FROM node:18-alpine

WORKDIR /app

COPY services/backend/package*.json ./

RUN npm install 

COPY services/backend/ ./

CMD ["npm", "run", "dev"]
