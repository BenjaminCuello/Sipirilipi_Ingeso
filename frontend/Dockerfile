# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig*.json ./
COPY vite.config.ts .
COPY index.html .
COPY src ./src
COPY public ./public
COPY scripts ./scripts

ARG VITE_API_BASE_URL=http://localhost:4000/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
