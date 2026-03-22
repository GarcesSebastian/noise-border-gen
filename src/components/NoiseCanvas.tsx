'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useApp } from '@/hooks/useApp';
import { render as renderNoise, renderPreview, type RenderParams } from '@/lib/noiseEngine';

const PREVIEW_MAX_DIM = 256;

export default function NoiseCanvas() {
  const { state } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [canvasImage, setCanvasImage] = useState<HTMLCanvasElement | null>(null);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const fitScaleRef = useRef(1);
  const rafId = useRef<number>(0);
  const fullRenderTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastTouchDist = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (containerSize.w === 0 || containerSize.h === 0) return;
    const fs = Math.min(
      (containerSize.w * 0.85) / state.width,
      (containerSize.h * 0.85) / state.height,
      1
    );
    fitScaleRef.current = fs;
    scaleRef.current = fs;
    posRef.current = {
      x: (containerSize.w - state.width * fs) / 2,
      y: (containerSize.h - state.height * fs) / 2,
    };
    const stage = stageRef.current;
    if (stage) {
      stage.scale({ x: fs, y: fs });
      stage.position(posRef.current);
      stage.batchDraw();
    }
  }, [containerSize.w, containerSize.h, state.width, state.height]);

  const buildParams = useCallback((): RenderParams => ({
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
  }), [
    state.width, state.height, state.border, state.grainSize,
    state.amount, state.fade, state.bgColor, state.bgMode,
    state.corners, state.sidesNoise, state.sidesRadius, state.uploadedImage,
  ]);

  useEffect(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (fullRenderTimer.current) clearTimeout(fullRenderTimer.current);

    rafId.current = requestAnimationFrame(() => {
      const params = buildParams();
      setCanvasImage(renderPreview(params, PREVIEW_MAX_DIM));
    });

    fullRenderTimer.current = setTimeout(() => {
      setCanvasImage(renderNoise(buildParams()));
    }, 250);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (fullRenderTimer.current) clearTimeout(fullRenderTimer.current);
    };
  }, [buildParams]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = scaleRef.current;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;
    const clamped = Math.min(Math.max(newScale, fitScaleRef.current * 0.1), fitScaleRef.current * 20);

    const mx = (pointer.x - stage.x()) / oldScale;
    const my = (pointer.y - stage.y()) / oldScale;

    scaleRef.current = clamped;
    posRef.current = { x: pointer.x - mx * clamped, y: pointer.y - my * clamped };

    stage.scale({ x: clamped, y: clamped });
    stage.position(posRef.current);
    stage.batchDraw();
  }, []);

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touch = e.evt;
    if (touch.touches.length !== 2) return;
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const t1 = touch.touches[0];
    const t2 = touch.touches[1];
    const dist = Math.sqrt((t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2);
    const center = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

    if (lastTouchDist.current === 0) {
      lastTouchDist.current = dist;
      lastTouchCenter.current = center;
      return;
    }

    const newScale = scaleRef.current * (dist / lastTouchDist.current);
    const clamped = Math.min(Math.max(newScale, fitScaleRef.current * 0.1), fitScaleRef.current * 20);
    const dx = center.x - lastTouchCenter.current.x;
    const dy = center.y - lastTouchCenter.current.y;

    scaleRef.current = clamped;
    posRef.current = { x: stage.x() + dx, y: stage.y() + dy };

    stage.scale({ x: clamped, y: clamped });
    stage.position(posRef.current);
    stage.batchDraw();

    lastTouchDist.current = dist;
    lastTouchCenter.current = center;
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = 0;
  }, []);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    posRef.current = { x: e.target.x(), y: e.target.y() };
  }, []);

  const resetView = useCallback(() => {
    const fs = fitScaleRef.current;
    scaleRef.current = fs;
    posRef.current = {
      x: (containerSize.w - state.width * fs) / 2,
      y: (containerSize.h - state.height * fs) / 2,
    };
    const stage = stageRef.current;
    if (stage) {
      stage.scale({ x: fs, y: fs });
      stage.position(posRef.current);
      stage.batchDraw();
    }
  }, [containerSize, state.width, state.height]);

  return (
    <div className="canvas-col">
      <div
        ref={containerRef}
        className="checker"
        style={{ backgroundColor: state.canvasBgColor }}
      >
        {containerSize.w > 0 && containerSize.h > 0 && (
          <Stage
            ref={stageRef}
            width={containerSize.w}
            height={containerSize.h}
            draggable
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDragEnd={handleDragEnd}
          >
            <Layer imageSmoothingEnabled={false}>
              {canvasImage && (
                <KonvaImage
                  image={canvasImage}
                  width={state.width}
                  height={state.height}
                />
              )}
            </Layer>
          </Stage>
        )}
      </div>
      <div className="canvas-bottom-bar">
        <span className="size-note">{state.width} × {state.height} px</span>
        <button className="ctrl-btn" onClick={resetView} title="Reiniciar vista">⟲</button>
      </div>
    </div>
  );
}
