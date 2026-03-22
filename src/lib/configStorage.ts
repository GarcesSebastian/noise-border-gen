// ── Config Storage ──
// Handles localStorage persistence for saved configurations

import type { AppState } from '@/contexts/AppContext';

export interface SavedConfig {
  name: string;
  state: Omit<AppState, 'uploadedImage' | 'uploadedImageSrc'>;
}

const STORAGE_KEY = 'nbg_configs';
const MAX_CONFIGS = 20;

export const DEFAULT_CONFIG: SavedConfig = {
  name: 'Default (CaaDev)',
  state: {
    width: 512,
    height: 512,
    bgMode: 'color',
    bgColor: '#ffffff',
    border: 60,
    grainSize: 4.5,
    amount: 0.95,
    fade: 3.0,
    corners: { tl: 60, tr: 60, bl: 60, br: 60 },
    cornersLinked: true,
    sidesNoise: { top: true, bottom: true, left: true, right: true },
    sidesRadius: { top: true, bottom: true, left: true, right: true },
    activeTab: 'canvas',
    canvasBgColor: '#1a1a2e',
  },
};

export function loadConfigs(): SavedConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const configs: SavedConfig[] = raw ? JSON.parse(raw) : [];
    // Ensure default config exists
    if (!configs.find((c) => c.name === DEFAULT_CONFIG.name)) {
      configs.push(DEFAULT_CONFIG);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    }
    return configs;
  } catch {
    return [DEFAULT_CONFIG];
  }
}

export function saveConfigToStorage(name: string, state: SavedConfig['state']): SavedConfig[] {
  const configs = loadConfigs();
  configs.unshift({ name, state });
  const trimmed = configs.slice(0, MAX_CONFIGS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function deleteConfigFromStorage(index: number): SavedConfig[] {
  const configs = loadConfigs();
  configs.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  return configs;
}
