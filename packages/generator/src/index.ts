import type { Project } from '@brume/shared';
import { generateFiles } from './generateFiles';
import { parse } from './parse';
import type { GenerateResult } from './types';
import { validate } from './validate';

export type { GeneratedFile, GenerateResult, GenerationIssue } from './types';

/**
 * Generates the backend code of a Brume project.
 *
 * @remarks
 * The project is first validated: if it has issues, they are all returned and
 * no file is generated. Otherwise, it is parsed into the internal model, then
 * the files are generated from it. The `layout` of the project is ignored.
 *
 * @param project - The project document from the canvas.
 * @returns The generated files, or the issues found in the project.
 */
export async function generate(project: Project): Promise<GenerateResult> {
  const issues = validate(project);
  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, files: generateFiles(parse(project)) };
}
