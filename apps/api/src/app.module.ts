import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { HealthController } from './health/health.controller.js';
import { ProjectsModule } from './projects/projects.module.js';
import { validationPipe } from './validation/validation.pipe.js';

/**
 * Root module of the API: registers every controller and feature module.
 */
@Module({
  controllers: [HealthController],
  imports: [ProjectsModule],
  providers: [{ provide: APP_PIPE, useValue: validationPipe }],
})
export class AppModule {}
