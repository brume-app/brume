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
nvm use           # Node.js version from .nvmrc
corepack enable   # pnpm at the pinned version
pnpm install      # installs every workspace and sets up the Git hooks
cp .env.example .env
docker compose up # PostgreSQL, API and builder, with hot reload
```

## Running locally

`docker compose up` starts the whole stack. Your code is mounted into the containers, so the API and the builder reload when you save.

| Command                        | What it does                                                               |
| ------------------------------ | -------------------------------------------------------------------------- |
| `docker compose up`            | Starts PostgreSQL, applies the migrations, then starts the API and builder |
| `docker compose up --build -V` | Same, after a dependency or Prisma schema change (rebuilds `node_modules`) |
| `docker compose down`          | Stops everything, keeping the database data                                |

The API listens on <http://127.0.0.1:3000> and the builder on <http://localhost:5173>. Use `127.0.0.1` rather than `localhost` for the API in HTTP clients such as Bruno: the port is only published on IPv4.

To run the API or the builder on your machine instead (for example to run the tests), start only the database. Run the API and the builder in separate terminals, since each `dev` command keeps running until you stop it:

```sh
docker compose up postgres -d --wait
pnpm --filter @brume/api db:deploy
pnpm --filter @brume/api dev
pnpm --filter @brume/builder dev
```

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
