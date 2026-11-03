import type { Project } from '@brume/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Saves and loads project documents in PostgreSQL.
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Saves a new project.
   *
   * @returns The saved project, with its generated id and dates.
   */
  create(document: Project) {
    return this.prisma.project.create({
      data: { name: document.name, document },
    });
  }

  /**
   * Loads one project.
   *
   * @throws NotFoundException when no project has this id.
   */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  /**
   * Lists every project, most recently updated first.
   *
   * @remarks
   * Projects updated in the same millisecond are ordered by id, newest first
   * since ids are UUID v7, so the order never changes between two calls.
   *
   * @returns The id, name and last update of each project, without the
   * documents.
   */
  findAll() {
    return this.prisma.project.findMany({
      select: { id: true, name: true, updatedAt: true },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });
  }

  /**
   * Replaces the document of a project.
   *
   * @throws NotFoundException when no project has this id.
   */
  async update(id: string, document: Project) {
    try {
      return await this.prisma.project.update({
        where: { id },
        data: { name: document.name, document },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Project ${id} not found`);
      }
      throw error;
    }
  }
}
