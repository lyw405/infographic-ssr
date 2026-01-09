import { loadSVGResource, registerResourceLoader } from '@antv/infographic';
import type { ResourceConfig } from '@antv/infographic';

const ICON_URL_PREFIX = 'https://api.iconify.design/';
const ILLUS_URL_PREFIX = 'https://raw.githubusercontent.com/nicepkg/gpt-vis/refs/heads/master/src/assets/illus/';

const svgTextCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

async function fetchSVG(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const text = await response.text();
    if (!text || !text.trim().startsWith('<svg')) {
      return null;
    }
    return text;
  } catch {
    return null;
  }
}

function getResourceUrl(scene: string, data: string): string | null {
  if (scene === 'icon') {
    return `${ICON_URL_PREFIX}${data}.svg`;
  }
  if (scene === 'illus') {
    return `${ILLUS_URL_PREFIX}${data}.svg`;
  }
  return null;
}

export async function defaultResourceLoader(config: ResourceConfig): Promise<SVGSymbolElement | null> {
  const { data, scene } = config;

  try {
    const key = `${scene}::${data}`;
    let svgText: string | null;

    if (svgTextCache.has(key)) {
      svgText = svgTextCache.get(key)!;
    } else if (pendingRequests.has(key)) {
      svgText = await pendingRequests.get(key)!;
    } else {
      const fetchPromise = (async () => {
        const url = getResourceUrl(scene, data);
        if (!url) return null;

        const text = await fetchSVG(url);
        if (text) {
          svgTextCache.set(key, text);
        }
        return text;
      })();

      pendingRequests.set(key, fetchPromise);

      try {
        svgText = await fetchPromise;
      } finally {
        pendingRequests.delete(key);
      }
    }

    if (!svgText) {
      return null;
    }

    return loadSVGResource(svgText);
  } catch {
    return null;
  }
}

export function setupDefaultResourceLoader(): void {
  registerResourceLoader(defaultResourceLoader);
}
