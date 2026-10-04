# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
# Where contact form submissions are appended as JSON lines.
# Mounted as a volume in docker-compose.yml so data survives rebuilds.
ENV CONTACT_DATA_DIR=/app/data

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
