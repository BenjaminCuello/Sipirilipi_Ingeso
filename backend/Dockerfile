FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY scripts ./scripts
COPY tsconfig.json .
COPY src ./src

ENV NODE_ENV=development \
    PORT=4000

EXPOSE 4000

CMD ["npm", "run", "dev"]
