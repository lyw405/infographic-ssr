import { parseHTML } from 'linkedom';

let globalDocument: Document | null = null;
let globalWindow: (Window & { XMLSerializer: any; DOMParser: any }) | null = null;

export interface SSREnvironment {
  document: Document;
  window: Window;
}

export function createSSREnvironment(): SSREnvironment {
  const { document, window } = parseHTML('<!DOCTYPE html><html><body></body></html>');
  return { document: document as unknown as Document, window: window as unknown as Window };
}

export function initGlobalEnv(): SSREnvironment {
  if (globalDocument && globalWindow) {
    ensureGlobals(globalWindow);
    return { document: globalDocument, window: globalWindow };
  }

  const { document, window } = createSSREnvironment();
  globalDocument = document;
  globalWindow = window as any;

  ensureGlobals(globalWindow);

  return { document, window };
}

function ensureGlobals(window: any): void {
  if (typeof globalThis.document === 'undefined') {
    (globalThis as any).document = globalDocument;
  }
  if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = window;
  }
  if (typeof globalThis.XMLSerializer === 'undefined' || !(globalThis.XMLSerializer as any).prototype) {
    (globalThis as any).XMLSerializer = window.XMLSerializer;
  }
  if (typeof globalThis.DOMParser === 'undefined') {
    (globalThis as any).DOMParser = window.DOMParser;
  }
}

export function cleanupGlobalEnv(): void {
  globalDocument = null;
  globalWindow = null;
}
