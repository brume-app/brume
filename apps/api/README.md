# @brume/api

The Brume backend API, built with NestJS ([ADR-008](../../docs/adr/008-nestjs-backend.md)). Its database is PostgreSQL, accessed through Prisma ([ADR-009](../../docs/adr/009-prisma-orm.md)).

## Local setup

To run the API in Docker with the rest of the stack, use `docker compose up` instead (see the [root README](../../README.md#running-locally)). The steps below run it on your machine.

Run these commands from the repository root.

1. Create your local environment file. The defaults work as is:

   ```sh
   cp .env.example .env
   ```

2. Start only PostgreSQL in Docker and wait until it accepts connections:

   ```sh
   docker compose up postgres -d --wait
   ```

3. Apply the migrations:

   ```sh
   pnpm --filter @brume/api db:deploy
   ```

4. Start the API in watch mode, on <http://localhost:3000>:

   ```sh
   pnpm --filter @brume/api dev
   ```

`pnpm install` generates the Prisma client into `src/generated/prisma`. This folder is not committed.

## Tests

The API tests send real HTTP requests to the app and run against PostgreSQL, like the API itself. Before running them, start the database and apply the migrations (steps 2 and 3 of the local setup), then run from the repository root:

```sh
pnpm test apps/api
```

The tests only delete the projects they create, so they can run against your local database without losing your data. In CI, the `checks` job starts its own PostgreSQL and applies the migrations before running them.

## Database scripts

| Script        | What it does                                                 |
| ------------- | ------------------------------------------------------------ |
| `db:deploy`   | Applies the committed migrations, without creating new ones  |
| `db:migrate`  | Creates a migration from the schema changes, then applies it |
| `db:generate` | Regenerates the Prisma client from `prisma/schema.prisma`    |

## Changing the schema

1. Edit `prisma/schema.prisma`.
2. Create and apply the migration, with a name that says what it does:

   ```sh
   pnpm --filter @brume/api db:migrate --name add_project_owner
   ```

3. Regenerate the client, since `db:migrate` does not do it:

   ```sh
   pnpm --filter @brume/api db:generate
   ```

4. Commit the schema and the new folder in `prisma/migrations` together.

Never edit a migration once it is merged: add a new one instead.

## Configuration

| Variable       | Default | Used for                                                     |
| -------------- | ------- | ------------------------------------------------------------ |
| `DATABASE_URL` |         | PostgreSQL connection string, read by the Prisma CLI and API |
| `PORT`         | `3000`  | Port the API listens on, read from the environment           |

The Prisma CLI and `pnpm dev` read the root `.env` file when it exists. A variable already set in the environment, for example in CI, takes precedence.

The `POSTGRES_*` values only apply when the database volume is first created. To change them later, run `docker compose down -v`, which deletes the local data, then start the database and apply the migrations again.
