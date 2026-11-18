import type { ProjectModel } from './parse';
import { PRISMA_CONFIG } from './prismaConfig';
import { prismaSchema } from './prismaSchema';
import type { GeneratedFile } from './types';

/**
 * Generates the files of the backend from the internal model.
 *
 * @remarks
 * For now: the Prisma schema (`prisma/schema.prisma`) and the Prisma config
 * that points it to the database (`prisma.config.ts`). Files are sorted by
 * path, so the same project always gives the same list.
 */
export function generateFiles(model: ProjectModel): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { path: 'prisma/schema.prisma', content: prismaSchema(model) },
    { path: 'prisma.config.ts', content: PRISMA_CONFIG },
  ];
  return files.sort((a, b) => (a.path < b.path ? -1 : 1));
}
