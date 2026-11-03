# Development image: dependencies installed, source mounted by docker-compose.yml
FROM node:26.13.0-alpine AS dev

# Node 26 no longer ships Corepack, so install it to get pnpm at the version pinned in package.json
RUN npm install --global corepack@0.36.0 && corepack enable

# Run as the image's non-root user, so files written into the mounted checkout are not owned by root
WORKDIR /app
RUN chown node:node /app
USER node

# Manifests first, so the install layer is cached until a dependency changes
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/api/package.json apps/api/prisma.config.ts apps/api/
COPY --chown=node:node apps/api/prisma apps/api/prisma
COPY --chown=node:node apps/builder/package.json apps/builder/
COPY --chown=node:node packages/generator/package.json packages/generator/
COPY --chown=node:node packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .
