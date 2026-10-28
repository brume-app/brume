import type { Project } from '@brume/shared';
import type { GenerationIssue } from './types';

/**
 * Checks that a project is consistent before generation.
 *
 * @remarks
 * Stub for now: always returns no issues. The checks across models and
 * relations come with #29.
 *
 * @returns Every issue found, or an empty array if the project is valid.
 */
export function validate(_project: Project): GenerationIssue[] {
  return [];
}
