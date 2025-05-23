FROM node:18-alpine
RUN apk add --no-cache curl tar
ARG KUBECTL_VERSION=v1.27.3
RUN curl -LO https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl \
 && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
 && rm kubectl
WORKDIR /app
ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}
COPY services/backend/package*.json ./
RUN npm install
COPY services/backend/ ./
CMD ["npm", "run", "dev"]