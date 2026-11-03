import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * Provides `PrismaService` to the modules that import it.
 */
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
