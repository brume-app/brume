import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Testing Library only cleans up automatically with `globals: true`, which we don't use.
afterEach(() => {
  cleanup();
});

// jsdom has no layout engine, so React Flow cannot measure the canvas or its nodes.
// The mocks below fake just enough of the browser for it to render.
// Adapted from https://reactflow.dev/learn/advanced-use/testing

// Calls back once on observe, as if the browser had measured the element.
// `contentRect` is read by the zoom code and is missing from the docs version.
class ResizeObserverMock {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
        } as ResizeObserverEntry,
      ],
      this,
    );
  }

  unobserve() {}

  disconnect() {}
}

// React Flow reads the zoom level from `m22`, parsed from the CSS `scale(...)`.
class DOMMatrixReadOnlyMock {
  readonly m22: number;

  constructor(transform?: string) {
    const scale = /scale\(([\d.]+)\)/.exec(transform ?? '')?.[1];
    this.m22 = scale === undefined ? 1 : Number(scale);
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
vi.stubGlobal('DOMMatrixReadOnly', DOMMatrixReadOnlyMock);

// jsdom reports every size as 0, and React Flow hides nodes measured at 0.
Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: {
    get(this: HTMLElement) {
      return parseFloat(this.style.height) || 1;
    },
  },
  offsetWidth: {
    get(this: HTMLElement) {
      return parseFloat(this.style.width) || 1;
    },
  },
});

// Edge labels are measured with getBBox, which jsdom does not implement.
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
});
