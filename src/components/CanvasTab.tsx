'use client';

import React, { useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { loadImageFile } from '@/utils/helpers';

const PRESETS = [
  { w: 512, h: 512, label: '512²' },
  { w: 256, h: 256, label: '256²' },
  { w: 1024, h: 256, label: '1024×256' },
  { w: 512, h: 256, label: '512×256' },
];

export default function CanvasTab() {
  const { state, dispatch } = useApp();
  const [localW, setLocalW] = useState(String(state.width));
  const [localH, setLocalH] = useState(String(state.height));
  const [activePreset, setActivePreset] = useState<string | null>('512x512');
  const [thumbSrc, setThumbSrc] = useState<string | null>(state.uploadedImageSrc);
  const [dragOver, setDragOver] = useState(false);

  const handlePreset = (w: number, h: number, label: string) => {
    dispatch({ type: 'SET_SIZE', width: w, height: h });
    setLocalW(String(w));
    setLocalH(String(h));
    setActivePreset(`${w}x${h}`);
  };

  const handleApply = () => {
    const nw = parseInt(localW);
    const nh = parseInt(localH);
    if (nw >= 32 && nh >= 32 && nw <= 4096 && nh <= 4096) {
      dispatch({ type: 'SET_SIZE', width: nw, height: nh });
      setActivePreset(null);
    }
  };

  const handleImageLoad = async (file: File) => {
    try {
      const { img, src } = await loadImageFile(file);
      dispatch({ type: 'SET_UPLOADED_IMAGE', image: img, src });
      setThumbSrc(src);
      const w = Math.min(img.width, 2048);
      const h = Math.min(img.height, 2048);
      dispatch({ type: 'SET_SIZE', width: w, height: h });
      setLocalW(String(w));
      setLocalH(String(h));
      setActivePreset(null);
    } catch { }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageLoad(file);
  };

  return (
    <div className="tp on" id="tp-canvas">
      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Tamaño</p>
        <div className="size-row" id="presets">
          {PRESETS.map((p) => (
            <button
              key={`${p.w}x${p.h}`}
              className={`pbtn ${activePreset === `${p.w}x${p.h}` ? 'on' : ''}`}
              onClick={() => handlePreset(p.w, p.h, p.label)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="ninput-row" style={{ marginTop: '.45rem' }}>
          <div className="ni-wrap">
            <label>W</label>
            <input
              type="number"
              value={localW}
              min={32}
              max={4096}
              onChange={(e) => setLocalW(e.target.value)}
            />
          </div>
          <span className="sx">×</span>
          <div className="ni-wrap">
            <label>H</label>
            <input
              type="number"
              value={localH}
              min={32}
              max={4096}
              onChange={(e) => setLocalH(e.target.value)}
            />
          </div>
          <button className="btn-sm" onClick={handleApply}>OK</button>
        </div>
      </div>

      <div className="divider" />

      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Fondo</p>
        <div className="mtabs">
          <div
            className={`mtab ${state.bgMode === 'color' ? 'on' : ''}`}
            onClick={() => dispatch({ type: 'SET_BG_MODE', mode: 'color' })}
          >
            Color
          </div>
          <div
            className={`mtab ${state.bgMode === 'image' ? 'on' : ''}`}
            onClick={() => dispatch({ type: 'SET_BG_MODE', mode: 'image' })}
          >
            Imagen
          </div>
        </div>

        {state.bgMode === 'color' && (
          <div className="bg-sec">
            <div className="color-row">
              <label>Color del panel</label>
              <input
                type="color"
                value={state.bgColor}
                onChange={(e) => dispatch({ type: 'SET_BG_COLOR', color: e.target.value })}
              />
            </div>
          </div>
        )}

        {state.bgMode === 'image' && (
          <div className="bg-sec">
            <div
              className={`upload-zone ${dragOver ? 'drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageLoad(file);
                }}
              />
              {!thumbSrc && (
                <p>Arrastra una imagen o <span>haz click</span></p>
              )}
              {thumbSrc && (
                <img
                  src={thumbSrc}
                  alt="Preview"
                  className="upload-thumb"
                  style={{ display: 'block' }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="divider" />

      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Color de fondo del lienzo</p>
        <div className="color-row">
          <label>Color del lienzo</label>
          <input
            type="color"
            value={state.canvasBgColor}
            onChange={(e) => dispatch({ type: 'SET_CANVAS_BG_COLOR', color: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
