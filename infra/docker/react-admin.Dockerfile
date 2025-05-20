FROM node:18-alpine
WORKDIR /app
COPY apps/webapp2_med_devices/package*.json ./
RUN npm install && npm rebuild esbuild --build-from-source
COPY apps/webapp2_med_devices/ ./
CMD ["npm", "run", "dev"]