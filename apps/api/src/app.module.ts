import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';

/**
 * Root module of the API: registers every controller and feature module.
 */
@Module({ controllers: [HealthController] })
export class AppModule {}
