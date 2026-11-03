# Development image: dependencies installed, source mounted by docker-compose.yml
FROM node:24.11.0-alpine AS dev

WORKDIR /app

# The corepack bundled with Node 24 is too old for pnpm 12
RUN npm install --global corepack@0.36.0 && corepack enable

# Manifests first, so the install layer is cached until a dependency changes
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/prisma.config.ts apps/api/
COPY apps/api/prisma apps/api/prisma
COPY apps/builder/package.json apps/builder/
COPY packages/generator/package.json packages/generator/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY . .
