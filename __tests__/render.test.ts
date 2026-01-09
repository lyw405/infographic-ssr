import { describe, it, expect, beforeAll } from 'vitest';
import { renderToSVGString, renderToSVG, initGlobalEnv } from '../src';

describe('renderToSVGString', () => {
  beforeAll(() => {
    initGlobalEnv();
  });

  it('should render from data array', async () => {
    const svg = await renderToSVGString(
      [
        { label: 'Step 1', value: 10 },
        { label: 'Step 2', value: 20 },
      ],
      { template: 'list-grid-simple' }
    );

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it.skip('should render from syntax string', async () => {
    const svg = await renderToSVGString(`
template: list-grid-simple
data:
  items:
    - label: Item 1
    - label: Item 2
    - label: Item 3
    `);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should optimize SVG when optimize option is true', async () => {
    const unoptimized = await renderToSVGString(
      [{ label: 'A' }, { label: 'B' }],
      { template: 'list-grid-simple', optimize: false }
    );

    const optimized = await renderToSVGString(
      [{ label: 'A' }, { label: 'B' }],
      { template: 'list-grid-simple', optimize: true }
    );

    expect(optimized.length).toBeLessThanOrEqual(unoptimized.length);
  });

  it('should use default template when not specified', async () => {
    const svg = await renderToSVGString([
      { label: 'Item A' },
      { label: 'Item B' },
    ]);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });
});

describe('renderToSVG', () => {
  beforeAll(() => {
    initGlobalEnv();
  });

  it('should return SVGSVGElement', async () => {
    const svg = await renderToSVG(
      [{ label: 'Test' }],
      { template: 'list-grid-simple' }
    );

    expect(svg).toBeDefined();
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });
});
