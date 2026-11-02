import type { Project } from '@brume/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
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
}
