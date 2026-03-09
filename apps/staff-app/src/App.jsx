import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import BoothSelection from './pages/BoothSelection';
import StaffDashboard from './pages/StaffDashboard';
import { fetchThemes, socket } from './utils/api';

export default function App() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loadingThemes, setLoadingThemes] = useState(true);

  useEffect(() => {
    fetchThemes()
      .then(setThemes)
      .catch(console.error)
      .finally(() => setLoadingThemes(false));
  }, []);

  if (loadingThemes) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', flexDirection: 'column', gap: 20
      }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
          Loading system…
        </div>
      </div>
    );
  }

  if (!selectedTheme) {
    return <BoothSelection themes={themes} onSelect={setSelectedTheme} />;
  }

  return (
    <StaffDashboard
      theme={selectedTheme}
      onChangeBooth={() => setSelectedTheme(null)}
    />
  );
}
