import type { Project } from '@brume/shared';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';

/**
 * Serves the `/projects` endpoints.
 */
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  create(@Body() document: Project) {
    return this.projects.create(document);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.findOne(id);
  }
}
