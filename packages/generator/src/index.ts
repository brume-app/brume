import type { Project } from '@brume/shared';
import { generateFiles } from './generateFiles';
import { parse } from './parse';
import type { GenerateResult } from './types';
import { validate } from './validate';

export type { GeneratedFile, GenerateResult, GenerationIssue } from './types';

export async function generate(project: Project): Promise<GenerateResult> {
  const issues = validate(project);
  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, files: generateFiles(parse(project)) };
}
