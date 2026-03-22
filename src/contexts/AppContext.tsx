'use client';

import React, { createContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Corners, SidesToggles } from '@/lib/noiseEngine';

export type TabName = 'canvas' | 'shape' | 'grain' | 'configs';

export interface AppState {
  width: number;
  height: number;
  bgMode: 'color' | 'image';
  bgColor: string;
  border: number;
  grainSize: number;
  amount: number;
  fade: number;
  corners: Corners;
  cornersLinked: boolean;
  sidesNoise: SidesToggles;
  sidesRadius: SidesToggles;
  activeTab: TabName;
  uploadedImage: HTMLImageElement | null;
  uploadedImageSrc: string | null;
  canvasBgColor: string;
}

export type AppAction =
  | { type: 'SET_SIZE'; width: number; height: number }
  | { type: 'SET_BG_MODE'; mode: 'color' | 'image' }
  | { type: 'SET_BG_COLOR'; color: string }
  | { type: 'SET_BORDER'; value: number }
  | { type: 'SET_GRAIN_SIZE'; value: number }
  | { type: 'SET_AMOUNT'; value: number }
  | { type: 'SET_FADE'; value: number }
  | { type: 'SET_CORNER'; key: keyof Corners; value: number }
  | { type: 'SET_ALL_CORNERS'; value: number }
  | { type: 'TOGGLE_CORNERS_LINKED' }
  | { type: 'TOGGLE_SIDE_NOISE'; side: keyof SidesToggles }
  | { type: 'TOGGLE_SIDE_RADIUS'; side: keyof SidesToggles }
  | { type: 'SET_TAB'; tab: TabName }
  | { type: 'SET_UPLOADED_IMAGE'; image: HTMLImageElement | null; src: string | null }
  | { type: 'APPLY_STATE'; state: Partial<AppState> }
  | { type: 'SET_CANVAS_BG_COLOR'; color: string };

export const INITIAL_STATE: AppState = {
  width: 512,
  height: 512,
  bgMode: 'color',
  bgColor: '#ffffff',
  border: 44,
  grainSize: 3.5,
  amount: 0.55,
  fade: 2.0,
  corners: { tl: 60, tr: 60, bl: 60, br: 60 },
  cornersLinked: true,
  sidesNoise: { top: true, bottom: true, left: true, right: true },
  sidesRadius: { top: true, bottom: true, left: true, right: true },
  activeTab: 'canvas',
  uploadedImage: null,
  uploadedImageSrc: null,
  canvasBgColor: '#1a1a2e',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SIZE':
      return { ...state, width: action.width, height: action.height };
    case 'SET_BG_MODE':
      return { ...state, bgMode: action.mode };
    case 'SET_BG_COLOR':
      return { ...state, bgColor: action.color };
    case 'SET_BORDER':
      return { ...state, border: action.value };
    case 'SET_GRAIN_SIZE':
      return { ...state, grainSize: action.value };
    case 'SET_AMOUNT':
      return { ...state, amount: action.value };
    case 'SET_FADE':
      return { ...state, fade: action.value };
    case 'SET_CORNER':
      return { ...state, corners: { ...state.corners, [action.key]: action.value } };
    case 'SET_ALL_CORNERS':
      return {
        ...state,
        corners: { tl: action.value, tr: action.value, bl: action.value, br: action.value },
      };
    case 'TOGGLE_CORNERS_LINKED':
      return { ...state, cornersLinked: !state.cornersLinked };
    case 'TOGGLE_SIDE_NOISE':
      return {
        ...state,
        sidesNoise: { ...state.sidesNoise, [action.side]: !state.sidesNoise[action.side] },
      };
    case 'TOGGLE_SIDE_RADIUS':
      return {
        ...state,
        sidesRadius: { ...state.sidesRadius, [action.side]: !state.sidesRadius[action.side] },
      };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImage: action.image, uploadedImageSrc: action.src };
    case 'APPLY_STATE':
      return { ...state, ...action.state };
    case 'SET_CANVAS_BG_COLOR':
      return { ...state, canvasBgColor: action.color };
    default:
      return state;
  }
}

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
