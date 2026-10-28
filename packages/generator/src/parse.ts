import type { Project } from '@brume/shared';

/**
 * The internal representation the generator works on.
 *
 * @remarks
 * Same shape as {@link Project} for now; #28 defines it.
 */
export type ProjectModel = Project;

/**
 * Turns a valid project into the generator internal model.
 *
 * @remarks
 * Stub for now: returns the project as is. Expects a project already checked
 * by `validate`.
 */
export function parse(project: Project): ProjectModel {
  return project;
}
