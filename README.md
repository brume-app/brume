# Brume

Brume is a visual backend builder. Design your data model on a canvas (models, fields, relations), then export a ready-to-run backend project.

> **Status:** early development. Brume is not usable yet.

## Prerequisites

- Node.js, at the version pinned in [`.nvmrc`](.nvmrc)
- pnpm, enabled through Corepack (the version is pinned in `package.json`)
- Docker and Docker Compose (needed once the API and database are added)
- Git and a GitHub account

## Getting started

```sh
git clone https://github.com/brume-app/brume.git
cd brume
nvm use         # Node.js version from .nvmrc
corepack enable # pnpm at the pinned version
pnpm install    # installs every workspace and sets up the Git hooks
```

## Commands

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `pnpm lint`         | Runs ESLint, with zero warnings |
| `pnpm format`       | Formats the code with Prettier  |
| `pnpm format:check` | Checks the formatting           |
| `pnpm typecheck`    | Type-checks every package       |

## Project structure

| Folder               | Content                                            |
| -------------------- | -------------------------------------------------- |
| `apps/builder`       | The canvas web application                         |
| `apps/api`           | The Brume backend API                              |
| `packages/generator` | The code generation engine                         |
| `packages/shared`    | The exchange format shared by canvas and generator |

## Contributing

Contribution guidelines are coming soon. In the meantime, questions and ideas are welcome in [GitHub Discussions](https://github.com/brume-app/brume/discussions). To report a security issue, see [SECURITY.md](SECURITY.md).

## License

No license has been chosen yet.
