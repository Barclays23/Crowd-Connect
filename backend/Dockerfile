# backend/Dockerfile:



    # Stage 1: Build the TypeScript code
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build



    # Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Install Doppler CLI inside the container
RUN apk add --no-cache curl gnupg && \
    (curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sh && \
    apk del curl gnupg

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

# Use Doppler as the entrypoint to inject secrets at runtime
ENTRYPOINT ["doppler", "run", "--"]
CMD ["npm", "start"]
