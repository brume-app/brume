import {
  BadRequestException,
  StandardSchemaValidationPipe,
} from '@nestjs/common';

/**
 * Validates every route parameter that has a schema, such as
 * `@Body({ schema })`.
 *
 * @remarks
 * An invalid value is answered with 400 and the list of issues, each with the
 * path of the invalid value and a message, so clients can show them next to
 * the right field.
 */
export const validationPipe = new StandardSchemaValidationPipe({
  exceptionFactory: (issues) =>
    new BadRequestException({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: issues.map((issue) => ({
        path:
          issue.path?.map((segment) =>
            typeof segment === 'object' ? segment.key : segment,
          ) ?? [],
        message: issue.message,
      })),
    }),
});
