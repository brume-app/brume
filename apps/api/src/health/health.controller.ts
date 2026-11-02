import { projectSchema } from '@brume/shared';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', projectVersion: projectSchema.shape.version.value };
  }
}
