import { describe, it, expect } from 'vitest';
import { initGlobalEnv, cleanupGlobalEnv, createSSREnvironment } from '../src';

describe('SSR Environment', () => {
  it('should create SSR environment', () => {
    const env = createSSREnvironment();

    expect(env.document).toBeDefined();
    expect(env.window).toBeDefined();
  });

  it('should initialize global environment', () => {
    const env = initGlobalEnv();

    expect(env.document).toBeDefined();
    expect(env.window).toBeDefined();
    expect(globalThis.document).toBeDefined();
    expect(globalThis.window).toBeDefined();
  });

  it('should reuse existing global environment', () => {
    const env1 = initGlobalEnv();
    const env2 = initGlobalEnv();

    expect(env1.document).toBe(env2.document);
    expect(env1.window).toBe(env2.window);
  });
});
