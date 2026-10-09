# frontend/Dockerfile:



    # Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install Doppler CLI in the builder stage
RUN apk add --no-cache curl gnupg && \
    (curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sh

COPY package*.json ./
RUN npm ci
COPY . .

# Accept the token as a build argument and use it during the Vite build
ARG DOPPLER_TOKEN
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN doppler run -- npm run build






    # Stage 2: Nginx Web Server
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
