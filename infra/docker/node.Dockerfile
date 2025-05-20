FROM node:18-alpine
WORKDIR /app
ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}
COPY services/backend/package*.json ./
RUN npm install
COPY services/backend/ ./
CMD ["npm", "run", "dev"]
