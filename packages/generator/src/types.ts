/**
 * A file produced by the generator.
 */
export interface GeneratedFile {
  /** Path from the root of the generated project, with `/` separators. */
  path: string;
  /** Full text content of the file. */
  content: string;
}

/**
 * A problem in the project that prevents generation.
 */
export interface GenerationIssue {
  /** Where the problem is in the project, e.g. `['models', 0, 'name']`. */
  path: (string | number)[];
  /** Human-readable description of the problem. */
  message: string;
}

/**
 * Outcome of a generation: the generated files, or the issues that prevented
 * it.
 *
 * @remarks
 * Check `ok` before reading `files` or `issues`.
 */
export type GenerateResult =
  | { ok: true; files: GeneratedFile[] }
  | { ok: false; issues: GenerationIssue[] };
