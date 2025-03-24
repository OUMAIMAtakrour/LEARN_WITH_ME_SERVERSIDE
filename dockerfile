# Build stage
FROM node:23-alpine3.21 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM node:23-alpine3.21
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main"]