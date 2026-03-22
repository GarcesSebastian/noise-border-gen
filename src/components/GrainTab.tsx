'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';

export default function GrainTab() {
  const { state, dispatch } = useApp();

  return (
    <div className="tp on" id="tp-grain">
      <div className="rows">
        <div className="row">
          <div className="lbl">
            Tamaño de grano <b>{state.grainSize.toFixed(1)}</b>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={0.5}
            value={state.grainSize}
            onChange={(e) => dispatch({ type: 'SET_GRAIN_SIZE', value: parseFloat(e.target.value) })}
          />
        </div>
        <div className="row">
          <div className="lbl">
            Cantidad <b>{state.amount.toFixed(2)}</b>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.01}
            value={state.amount}
            onChange={(e) => dispatch({ type: 'SET_AMOUNT', value: parseFloat(e.target.value) })}
          />
        </div>
        <div className="row">
          <div className="lbl">
            Fade hacia el centro <b>{state.fade.toFixed(1)}</b>
          </div>
          <input
            type="range"
            min={0.3}
            max={6}
            step={0.1}
            value={state.fade}
            onChange={(e) => dispatch({ type: 'SET_FADE', value: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
