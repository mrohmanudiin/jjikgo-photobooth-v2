import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import BoothSelection from './pages/BoothSelection';
import StaffDashboard from './pages/StaffDashboard';
import { fetchThemes, fetchQueue, socket } from './utils/api';

export default function App() {
  const [themes, setThemes] = useState([]);
  const [queueData, setQueueData] = useState({});
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(true);

  const refreshQueue = useCallback(async () => {
    try {
      const data = await fetchQueue();
      setQueueData(data);
    } catch (e) {
      console.error('Fetch queue error:', e);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    setLoadingThemes(true);
    fetchThemes()
      .then(setThemes)
      .catch(console.error)
      .finally(() => setLoadingThemes(false));

    refreshQueue();

    // Polling every 5s as fallback
    const intervalId = setInterval(refreshQueue, 5000);

    // Listen for queue updates
    socket.on('queueUpdated', refreshQueue);
    return () => {
      clearInterval(intervalId);
      socket.off('queueUpdated', refreshQueue);
    };
  }, [refreshQueue]);

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
    return (
      <BoothSelection 
        themes={themes} 
        queueData={queueData}
        loading={loadingQueue}
        onSelect={setSelectedTheme} 
      />
    );
  }

  return (
    <StaffDashboard
      theme={selectedTheme}
      queueData={queueData}
      loading={loadingQueue}
      refresh={refreshQueue}
      onChangeBooth={() => setSelectedTheme(null)}
    />
  );
}
