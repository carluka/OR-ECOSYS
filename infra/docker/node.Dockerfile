FROM node:18-alpine

# 1) delovni dir
WORKDIR /app

# 2) kopiraj definicijo paketov in lockfile
COPY services/backend/package*.json ./

# 3) namestitev in rebuild native modulov
RUN npm install 

# 4) kopiraj celotno kodo
COPY services/backend/ ./

# 5) razvojni zagon
CMD ["npm", "run", "dev"]
