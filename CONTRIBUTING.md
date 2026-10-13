# Contributing to Brume

Thank you for your interest in Brume. This guide explains how we work, so that your first pull request goes smoothly.

## Ways to contribute

- Pick an issue labelled `good first issue` or `help wanted`.
- Report a bug or suggest a feature with the issue forms.
- Ask questions and discuss ideas in [GitHub Discussions](https://github.com/brume-app/brume/discussions). Large features start as an RFC there.
- To report a security problem, follow [SECURITY.md](SECURITY.md). Never open a public issue for it.

Everything is written in English: code, commits, issues, pull requests and documentation.

## Getting started

Follow the [README](README.md) to clone the repository and install the dependencies. Installing sets up the Git hooks that check your code and your commit messages before each commit.

## Workflow

We use GitHub Flow. `main` is protected and always deployable. Every change goes through a short-lived branch and a pull request, and pull requests are squash-merged.

### Branches

Name: `<type>/<issue-number>-<short-description>`, for example `feat/42-model-block` or `fix/57-empty-relations`.

- One branch per issue, kept short-lived.
- Update your branch from `main` before asking for review if it has fallen behind.

### Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`, in English, imperative mood, lowercase description.

| Type       | Use for                              |
| ---------- | ------------------------------------ |
| `feat`     | A new feature                        |
| `fix`      | A bug fix                            |
| `docs`     | Documentation only                   |
| `refactor` | Code change with no behaviour change |
| `test`     | Adding or fixing tests               |
| `chore`    | Tooling, dependencies, configuration |
| `ci`       | CI/CD pipelines                      |
| `perf`     | Performance improvement              |

Scopes: `canvas`, `generator`, `api`, `shared`, `infra`, `docs`, `adr`, `deps`. A breaking change adds `!` after the scope (`feat(shared)!: rename field types`) and a `BREAKING CHANGE:` footer.

Because pull requests are squash-merged, the **pull request title becomes the commit on `main`**: it must follow the same format. A CI check enforces it.

## Pull requests

- Open it early as a draft to show where you are going.
- Keep it small, under about 400 changed lines. Split big changes.
- Fill in the pull request template, with screenshots or a short recording for any UI change.
- Link the issue with `Closes #<number>`.
- Mark it ready for review when CI is green.

To be merged, a pull request needs the approval of a code owner of every changed folder (see [`.github/CODEOWNERS`](.github/CODEOWNERS)), all CI checks green and all review conversations resolved. The author merges, with a squash.

## Code review

Every review comment starts with a label, so the author knows what blocks the merge.

| Label         | Meaning                                    | Blocking?                    |
| ------------- | ------------------------------------------ | ---------------------------- |
| `issue:`      | A problem that must be fixed before merge  | Yes                          |
| `suggestion:` | A proposed improvement                     | No, unless marked (blocking) |
| `question:`   | The reviewer needs to understand something | Until answered               |
| `nit:`        | A small detail (naming, wording)           | No                           |
| `praise:`     | Something done well                        | No                           |

The reviewer gives a first response within 48 hours.

## Code conventions

- TypeScript in strict mode, formatted by Prettier and linted by ESLint with zero warnings allowed (`pnpm lint`, `pnpm format`, `pnpm typecheck`).
- Naming: `PascalCase` for components, types and interfaces (without an `I` prefix); `camelCase` for variables, functions and other files; `UPPER_SNAKE_CASE` for constants; `is`, `has` or `can` prefix for booleans.
- Every exported function, component and type has a TSDoc comment.
- Every bug fix comes with a test that reproduces the bug.
- Never commit secrets. `.env` files are ignored by Git.

## Using AI tools

AI assistants are welcome for writing code, tests and documentation, under these rules:

- You are responsible for every line you submit, and you must be able to explain it in review.
- Do not paste large blocks you do not understand.
- If code looks copied from a known library, check where it comes from and its license before submitting it.
