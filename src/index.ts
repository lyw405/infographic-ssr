export { renderToSVG, renderToSVGString, renderWithResult } from './render.js';
export type { Input, RenderOptions, SSRError, SSRRenderResult, SvgoConfig } from './types.js';
export { initGlobalEnv, cleanupGlobalEnv, createSSREnvironment, isSSR } from './env.js';
export type { SSREnvironment } from './env.js';
export { optimizeSVG } from './optimize.js';
export { defaultResourceLoader, setupDefaultResourceLoader } from './resource-loader.js';
