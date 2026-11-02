# Brume

Brume is a visual backend builder. Design your data model on a canvas (models, fields, relations), then export a ready-to-run backend project.

> **Status:** early development. Brume is not usable yet.

## Prerequisites

- Node.js, at the version pinned in [`.nvmrc`](.nvmrc)
- pnpm, enabled through Corepack (the version is pinned in `package.json`)
- Docker and Docker Compose, to run PostgreSQL
- Git and a GitHub account

## Getting started

```sh
git clone https://github.com/brume-app/brume.git
cd brume
nvm use         # Node.js version from .nvmrc
corepack enable # pnpm at the pinned version
pnpm install    # installs every workspace and sets up the Git hooks
cp .env.example .env
```

## Running locally

| Command                              | What it does                                  |
| ------------------------------------ | --------------------------------------------- |
| `docker compose up -d --wait`        | Starts PostgreSQL and waits until it is ready |
| `pnpm --filter @brume/api db:deploy` | Applies the database migrations               |
| `pnpm --filter @brume/api dev`       | Starts the API in watch mode on port 3000     |
| `pnpm --filter @brume/builder dev`   | Starts the builder on <http://localhost:5173> |
| `docker compose down`                | Stops PostgreSQL, keeping its data            |

See the [API README](apps/api/README.md) for the database workflow.

## Commands

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `pnpm lint`         | Runs ESLint, with zero warnings |
| `pnpm format`       | Formats the code with Prettier  |
| `pnpm format:check` | Checks the formatting           |
| `pnpm typecheck`    | Type-checks every package       |
| `pnpm -r build`     | Builds every package            |
| `pnpm test`         | Runs the tests                  |

## Project structure

| Folder               | Content                                            |
| -------------------- | -------------------------------------------------- |
| `apps/builder`       | The canvas web application                         |
| `apps/api`           | The Brume backend API                              |
| `packages/generator` | The code generation engine                         |
| `packages/shared`    | The exchange format shared by canvas and generator |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Questions and ideas are welcome in [GitHub Discussions](https://github.com/brume-app/brume/discussions). To report a security issue, see [SECURITY.md](SECURITY.md).

## License

Brume is licensed under the [GNU AGPL-3.0](LICENSE).

The code that Brume generates for your projects belongs to you. The AGPL applies to Brume itself, not to the applications you build with it.
