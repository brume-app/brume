import { projectSchema, type Project } from '@brume/shared';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';

/**
 * Serves the `/projects` endpoints.
 */
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll() {
    return this.projects.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.findOne(id);
  }

  @Post()
  create(@Body({ schema: projectSchema }) document: Project) {
    return this.projects.create(document);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: projectSchema }) document: Project,
  ) {
    return this.projects.update(id, document);
  }
}
