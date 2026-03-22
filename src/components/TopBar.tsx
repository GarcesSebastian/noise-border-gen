'use client';

import React, { useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { exportPNG } from '@/lib/noiseEngine';
import { downloadBlob } from '@/utils/helpers';

export default function TopBar() {
  const { state } = useApp();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    const steps: [number, string][] = [
      [15, 'Generando ruido...'],
      [40, 'Calculando SDF...'],
      [72, 'Pintando píxeles...'],
      [92, 'Componiendo...'],
    ];

    for (const [pct, label] of steps) {
      setProgress(pct);
      setProgressLabel(label);
      await new Promise((r) => setTimeout(r, 70));
    }

    setProgress(98);
    setProgressLabel('Exportando...');

    try {
      const blob = await exportPNG({
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

      setProgress(100);
      setProgressLabel('¡Listo!');
      downloadBlob(blob, `noise_${state.width}x${state.height}.png`);
    } catch (e) {
      setProgressLabel('Error al exportar');
    }

    setTimeout(() => {
      setExporting(false);
      setProgress(0);
      setProgressLabel('');
    }, 1400);
  };

  return (
    <div className="topbar">
      <span className="topbar-title">Noise Border Gen</span>
      <div className="topbar-right">
        <button
          className="export-btn topbar-export-btn"
          id="btn-export"
          onClick={handleExport}
          disabled={exporting}
        >
          ⬇ Exportar PNG
        </button>
        {exporting && (
          <div className="prog on" style={{ minWidth: 140 }}>
            <div className="prog-bg">
              <div className="prog-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="prog-lbl">{progressLabel}</div>
          </div>
        )}
      </div>

      <button
        className="mobile-menu-btn"
        onClick={() => {
          setMobileMenuOpen(!mobileMenuOpen);
          document.body.classList.toggle('panel-open', !mobileMenuOpen);
        }}
        aria-label="Toggle panel"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
