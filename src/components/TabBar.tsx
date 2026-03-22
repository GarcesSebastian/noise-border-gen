'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import type { TabName } from '@/contexts/AppContext';

const TABS: { key: TabName; label: string }[] = [
  { key: 'canvas', label: 'Canvas' },
  { key: 'shape', label: 'Forma' },
  { key: 'grain', label: 'Granos' },
  { key: 'configs', label: 'Configs' },
];

export default function TabBar() {
  const { state, dispatch } = useApp();

  return (
    <div className="tabs">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`tab ${state.activeTab === t.key ? 'on' : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', tab: t.key })}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
