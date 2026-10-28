import type { ProjectModel } from './parse';
import type { GeneratedFile } from './types';

/**
 * Generates the files of the backend from the internal model.
 *
 * @remarks
 * Stub for now: returns no files. The Prisma schema comes with #30 and #31.
 */
export function generateFiles(_model: ProjectModel): GeneratedFile[] {
  return [];
}
