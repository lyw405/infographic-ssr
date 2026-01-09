import { parseHTML, DOMParser, Document } from 'linkedom';

const DOM_CLASSES = [
  'HTMLElement',
  'HTMLDivElement',
  'HTMLSpanElement',
  'HTMLImageElement',
  'HTMLCanvasElement',
  'HTMLInputElement',
  'HTMLButtonElement',
  'Element',
  'Node',
  'Text',
  'Comment',
  'DocumentFragment',
  'Document',
  'XMLSerializer',
  'MutationObserver',
];

const SVG_CLASSES = [
  'SVGElement',
  'SVGSVGElement',
  'SVGGraphicsElement',
  'SVGGElement',
  'SVGPathElement',
  'SVGRectElement',
  'SVGCircleElement',
  'SVGTextElement',
  'SVGLineElement',
  'SVGPolygonElement',
  'SVGPolylineElement',
  'SVGEllipseElement',
  'SVGImageElement',
  'SVGDefsElement',
  'SVGUseElement',
  'SVGClipPathElement',
  'SVGLinearGradientElement',
  'SVGRadialGradientElement',
  'SVGStopElement',
  'SVGPatternElement',
  'SVGMaskElement',
  'SVGForeignObjectElement',
];

let globalDoc: Document | null = null;
let globalWin: any = null;
let isSSRMode = false;

export interface SSREnvironment {
  document: Document;
  window: any;
}

export function isSSR(): boolean {
  return isSSRMode;
}

export function createSSREnvironment(): SSREnvironment {
  const { document, window } = parseHTML('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  return { document, window };
}

export function initGlobalEnv(): SSREnvironment {
  if (globalDoc && globalWin) {
    return { document: globalDoc, window: globalWin };
  }

  isSSRMode = true;

  const { document, window } = createSSREnvironment();

  globalDoc = document;
  globalWin = window;

  (global as any).window = window;
  (global as any).document = document;
  (global as any).DOMParser = DOMParser;

  DOM_CLASSES.forEach((name) => {
    if ((window as any)[name]) (global as any)[name] = (window as any)[name];
  });

  SVG_CLASSES.forEach((name) => {
    if ((window as any)[name]) (global as any)[name] = (window as any)[name];
  });

  if (!(document as any).fonts) {
    const fontSet = new Set();
    Object.defineProperty(document, 'fonts', {
      value: {
        add: (font: unknown) => fontSet.add(font),
        delete: (font: unknown) => fontSet.delete(font),
        has: (font: unknown) => fontSet.has(font),
        clear: () => fontSet.clear(),
        forEach: (callback: (font: unknown) => void) => fontSet.forEach(callback),
        entries: () => fontSet.entries(),
        keys: () => fontSet.keys(),
        values: () => fontSet.values(),
        [Symbol.iterator]: () => fontSet[Symbol.iterator](),
        get size() {
          return fontSet.size;
        },
        get ready() {
          return Promise.resolve(this);
        },
        check: () => true,
        load: () => Promise.resolve([]),
        get status() {
          return 'loaded';
        },
        onloading: null,
        onloadingdone: null,
        onloadingerror: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      },
      configurable: true,
    });
  }

  (globalThis as any).__ANTV_INFOGRAPHIC_SSR__ = true;

  (globalThis as any).requestAnimationFrame = (cb: any) => {
    setImmediate(cb);
    return 0;
  };

  return { window, document };
}

export function cleanupGlobalEnv(): void {
  DOM_CLASSES.forEach((name) => {
    delete (global as any)[name];
  });

  SVG_CLASSES.forEach((name) => {
    delete (global as any)[name];
  });

  delete (global as any).window;
  delete (global as any).document;
  delete (global as any).DOMParser;
  delete (globalThis as any).requestAnimationFrame;
  delete (globalThis as any).__ANTV_INFOGRAPHIC_SSR__;

  globalDoc = null;
  globalWin = null;
  isSSRMode = false;
}
