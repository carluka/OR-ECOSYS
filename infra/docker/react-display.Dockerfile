FROM node:18-alpine
WORKDIR /app
COPY apps/webapp1_realtime_data/package*.json ./
RUN npm install && npm rebuild esbuild --build-from-source
COPY apps/webapp1_realtime_data/ ./
CMD ["npm", "run", "dev"]