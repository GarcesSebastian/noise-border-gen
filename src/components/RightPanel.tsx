'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import TabBar from './TabBar';
import CanvasTab from './CanvasTab';
import ShapeTab from './ShapeTab';
import GrainTab from './GrainTab';
import ConfigsTab from './ConfigsTab';

export default function RightPanel() {
  const { state } = useApp();

  return (
    <div className="right-panel">
      <TabBar />
      <div className="tab-body">
        {state.activeTab === 'canvas' && <CanvasTab />}
        {state.activeTab === 'shape' && <ShapeTab />}
        {state.activeTab === 'grain' && <GrainTab />}
        {state.activeTab === 'configs' && <ConfigsTab />}
      </div>
    </div>
  );
}
