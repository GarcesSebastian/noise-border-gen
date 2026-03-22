'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useApp } from '@/hooks/useApp';
import { render as renderNoise } from '@/lib/noiseEngine';

export default function NoiseCanvas() {
  const { state } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const [canvasImage, setCanvasImage] = useState<HTMLCanvasElement | null>(null);
  const renderTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Debounced render
  useEffect(() => {
    if (renderTimeout.current) clearTimeout(renderTimeout.current);
    renderTimeout.current = setTimeout(() => {
      const off = renderNoise({
        width: state.width,
        height: state.height,
        border: state.border,
        grainSize: state.grainSize,
        amount: state.amount,
        fade: state.fade,
        bgColor: state.bgColor,
        bgMode: state.bgMode,
        corners: state.corners,
        sidesNoise: state.sidesNoise,
        sidesRadius: state.sidesRadius,
        uploadedImage: state.uploadedImage,
      });
      setCanvasImage(off);
    }, 50);
    return () => {
      if (renderTimeout.current) clearTimeout(renderTimeout.current);
    };
  }, [
    state.width, state.height, state.border, state.grainSize,
    state.amount, state.fade, state.bgColor, state.bgMode,
    state.corners, state.sidesNoise, state.sidesRadius, state.uploadedImage,
  ]);

  // Calculate scale to fit canvas in container with padding
  const padding = 40;
  const availW = containerSize.w - padding * 2;
  const availH = containerSize.h - padding * 2;
  const fitScale = Math.min(1, availW / state.width, availH / state.height);

  const displayW = state.width * fitScale;
  const displayH = state.height * fitScale;

  return (
    <div className="canvas-col">
      <div
        ref={containerRef}
        className="checker"
        style={{ backgroundColor: state.canvasBgColor }}
      >
        <Stage
          width={displayW}
          height={displayH}
          scaleX={fitScale}
          scaleY={fitScale}
        >
          <Layer imageSmoothingEnabled={false}>
            {canvasImage && (
              <KonvaImage
                image={canvasImage}
                width={state.width}
                height={state.height}
                x={0}
                y={0}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <div className="canvas-bottom-bar">
        <span className="size-note">{state.width} × {state.height} px</span>
        <button
          className="ctrl-btn"
          onClick={() => {
            if (renderTimeout.current) clearTimeout(renderTimeout.current);
            const off = renderNoise({
              width: state.width,
              height: state.height,
              border: state.border,
              grainSize: state.grainSize,
              amount: state.amount,
              fade: state.fade,
              bgColor: state.bgColor,
              bgMode: state.bgMode,
              corners: state.corners,
              sidesNoise: state.sidesNoise,
              sidesRadius: state.sidesRadius,
              uploadedImage: state.uploadedImage,
            });
            setCanvasImage(off);
          }}
          title="Reiniciar vista"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
