'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/hooks/useApp';
import {
  loadConfigs,
  saveConfigToStorage,
  deleteConfigFromStorage,
  type SavedConfig,
} from '@/lib/configStorage';
import type { AppState } from '@/contexts/AppContext';

export default function ConfigsTab() {
  const { state, dispatch } = useApp();
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [configName, setConfigName] = useState('');

  useEffect(() => {
    setConfigs(loadConfigs());
  }, []);

  const handleSave = () => {
    const name = configName.trim();
    if (!name) return;
    const stateToSave: SavedConfig['state'] = {
      width: state.width,
      height: state.height,
      bgMode: state.bgMode,
      bgColor: state.bgColor,
      border: state.border,
      grainSize: state.grainSize,
      amount: state.amount,
      fade: state.fade,
      corners: { ...state.corners },
      cornersLinked: state.cornersLinked,
      sidesNoise: { ...state.sidesNoise },
      sidesRadius: { ...state.sidesRadius },
      activeTab: state.activeTab,
      canvasBgColor: state.canvasBgColor,
    };
    const updated = saveConfigToStorage(name, stateToSave);
    setConfigs(updated);
    setConfigName('');
  };

  const handleDelete = (idx: number) => {
    const updated = deleteConfigFromStorage(idx);
    setConfigs(updated);
  };

  const handleLoad = (cfg: SavedConfig) => {
    dispatch({
      type: 'APPLY_STATE',
      state: {
        ...cfg.state,
        uploadedImage: state.uploadedImage,
        uploadedImageSrc: state.uploadedImageSrc,
      } as Partial<AppState>,
    });
  };

  return (
    <div className="tp on" id="tp-configs">
      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Guardar configuración</p>
        <div className="save-row">
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Nombre..."
            maxLength={32}
          />
          <button className="btn-save" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>

      <div className="divider" />

      <div>
        <p className="sec" style={{ marginBottom: '.5rem' }}>Configuraciones guardadas</p>
        <div className="cfg-list">
          {configs.length === 0 ? (
            <p className="cfg-empty">Sin configuraciones guardadas</p>
          ) : (
            configs.map((cfg, idx) => (
              <div key={idx} className="cfg-item" onClick={() => handleLoad(cfg)}>
                <span className="cfg-name">{cfg.name}</span>
                <button
                  className="cfg-del"
                  title="Eliminar"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
