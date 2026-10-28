import type { Project } from '@brume/shared';

export type ProjectModel = Project;

export function parse(project: Project): ProjectModel {
  return project;
}
