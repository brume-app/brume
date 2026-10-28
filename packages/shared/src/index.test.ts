import { describe, expect, it } from 'vitest';
import * as shared from './index.js';

describe('@brume/shared', () => {
  it('loads without error', () => {
    expect(shared).toBeDefined();
  });
});
