import { describe, it, expect } from 'vitest';
import { optimizeSVG } from '../src';

describe('optimizeSVG', () => {
  it('should optimize simple SVG', () => {
    const input = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="red"></rect>
    </svg>`;

    const output = optimizeSVG(input);

    expect(output).toContain('<svg');
    expect(output).toContain('</svg>');
    expect(output.length).toBeLessThanOrEqual(input.length);
  });

  it('should preserve viewBox', () => {
    const input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="0" y="0" width="100" height="100" fill="blue"/>
    </svg>`;

    const output = optimizeSVG(input);

    expect(output).toContain('viewBox');
  });

  it('should accept custom svgo config', () => {
    const input = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect id="my-rect" x="0" y="0" width="100" height="100" fill="green"/>
    </svg>`;

    const output = optimizeSVG(input, {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              cleanupIds: false,
            },
          },
        },
      ],
    });

    expect(output).toContain('my-rect');
  });
});
