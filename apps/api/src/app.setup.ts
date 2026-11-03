import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Largest JSON request body the API reads, in bytes, above which it answers
 * 413.
 */
export const bodyLimit = 1024 * 1024;

/**
 * Applies the settings that live on the app rather than in a module.
 *
 * @remarks
 * Called by `main.ts` and by the integration tests, so both run the API with
 * the same settings.
 */
export function configureApp(app: NestExpressApplication) {
  app.useBodyParser('json', { limit: bodyLimit });
}
