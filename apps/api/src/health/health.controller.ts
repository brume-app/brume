import { projectSchema } from '@brume/shared';
import { Controller, Get } from '@nestjs/common';

/**
 * Serves `GET /health`, which tells clients that the API is up.
 */
@Controller('health')
export class HealthController {
  /**
   * Reports the API status.
   *
   * @returns `status: 'ok'` and the project format version the API accepts,
   * read from `@brume/shared`.
   */
  @Get()
  check() {
    return { status: 'ok', projectVersion: projectSchema.shape.version.value };
  }
}
