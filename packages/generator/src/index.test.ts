import { blogProject, shopProject } from '@brume/shared/fixtures';
import { describe, expect, it, vi } from 'vitest';
import { generate } from './index';
import { validate } from './validate';

vi.mock('./validate', { spy: true });

describe('generate', () => {
  it.each([
    ['blog', blogProject],
    ['shop', shopProject],
  ])('generates the %s sample project', async (_name, project) => {
    const result = await generate(project);

    expect(result.ok).toBe(true);
  });

  it('returns the issues instead of files when the project is invalid', async () => {
    const issues = [
      { path: ['models', 0, 'name'], message: 'Duplicate model name' },
    ];
    vi.mocked(validate).mockReturnValueOnce(issues);

    const result = await generate(blogProject);

    expect(result).toEqual({ ok: false, issues });
  });
});
