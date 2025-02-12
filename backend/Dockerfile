# Build stage
FROM node:20.11.0-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20.11.0-slim

WORKDIR /app

ENV NODE_ENV="production"
ENV BACKEND_URL="https://mindmeld-87770296075.europe-west1.run.app"
ENV PORT=3000
ENV FRONTEND_URLS="https://mindmeldtool.netlify.app,https://nexus-tool.com"
ENV CLOUD_SQL_CONNECTION_NAME="mindmeld-backend:europe-west1:mindmeld-db"

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
