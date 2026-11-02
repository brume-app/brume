import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';
import { ProjectsModule } from './projects/projects.module.js';

/**
 * Root module of the API: registers every controller and feature module.
 */
@Module({ controllers: [HealthController], imports: [ProjectsModule] })
export class AppModule {}
