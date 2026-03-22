'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import type { Corners, SidesToggles } from '@/lib/noiseEngine';

export default function ShapeTab() {
  const { state, dispatch } = useApp();

  const handleCornerChange = (key: keyof Corners, val: number) => {
    if (state.cornersLinked) {
      dispatch({ type: 'SET_ALL_CORNERS', value: val });
    } else {
      dispatch({ type: 'SET_CORNER', key, value: val });
    }
  };

  const cornerPreviewStyle: React.CSSProperties = {
    borderRadius: `${state.corners.tl}px ${state.corners.tr}px ${state.corners.br}px ${state.corners.bl}px`,
  };

  const sideNoiseLabel: Record<keyof SidesToggles, string> = {
    top: 'Arriba',
    bottom: 'Abajo',
    left: 'Izquierda',
    right: 'Derecha',
  };

  return (
    <div className="tp on" id="tp-shape">
      <div>
        <p className="sec" style={{ marginBottom: '.6rem' }}>Radio de esquinas</p>
        <div className="corner-link-row">
          <span style={{ fontSize: '.72rem', color: 'var(--mut)' }}>Vincular todas</span>
          <div
            className={`link-tog ${state.cornersLinked ? 'on' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_CORNERS_LINKED' })}
          >
            {state.cornersLinked ? 'ON' : 'OFF'}
          </div>
        </div>
        <div style={{ marginTop: '.6rem' }}>
          <div className="corner-widget">
            <div className="cr-inp">
              <label>TL</label>
              <input
                type="number"
                value={state.corners.tl}
                min={0}
                max={512}
                onChange={(e) => handleCornerChange('tl', parseInt(e.target.value) || 0)}
              />
            </div>
            <div />
            <div className="cr-inp">
              <label>TR</label>
              <input
                type="number"
                value={state.corners.tr}
                min={0}
                max={512}
                onChange={(e) => handleCornerChange('tr', parseInt(e.target.value) || 0)}
              />
            </div>

            <div />
            <div className="cw-preview" style={cornerPreviewStyle} />
            <div />

            <div className="cr-inp">
              <label>BL</label>
              <input
                type="number"
                value={state.corners.bl}
                min={0}
                max={512}
                onChange={(e) => handleCornerChange('bl', parseInt(e.target.value) || 0)}
              />
            </div>
            <div />
            <div className="cr-inp">
              <label>BR</label>
              <input
                type="number"
                value={state.corners.br}
                min={0}
                max={512}
                onChange={(e) => handleCornerChange('br', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Grosor del borde</p>
        <div className="row">
          <div className="lbl">
            Grosor <b>{state.border}</b>px
          </div>
          <input
            type="range"
            min={4}
            max={150}
            value={state.border}
            onChange={(e) => dispatch({ type: 'SET_BORDER', value: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="divider" />

      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Ruido por lado</p>
        <div className="grid2">
          {(Object.keys(state.sidesNoise) as (keyof SidesToggles)[]).map((side) => (
            <div
              key={`sn-${side}`}
              className={`tog ${state.sidesNoise[side] ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_SIDE_NOISE', side })}
            >
              <span className="dot" />
              {sideNoiseLabel[side]}
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Radio por lado</p>
        <div className="grid2">
          {(Object.keys(state.sidesRadius) as (keyof SidesToggles)[]).map((side) => (
            <div
              key={`sr-${side}`}
              className={`tog ${state.sidesRadius[side] ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_SIDE_RADIUS', side })}
            >
              <span className="dot" />
              {sideNoiseLabel[side]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
