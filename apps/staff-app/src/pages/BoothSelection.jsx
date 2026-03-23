import React from 'react';

// SVG icons as inline components (no external dependency)
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const ACCENT_COLORS = [
  { bg: 'rgba(0, 240, 255, 0.08)', border: 'rgba(0, 240, 255, 0.2)', text: '#00F0FF' },
  { bg: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.2)', text: '#EC4899' },
  { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', text: '#10B981' },
  { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
  { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.2)', text: '#6366F1' },
  { bg: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.2)', text: '#F43F5E' },
];

export default function BoothSelection({ themes, queueData, onSelect, onLogout }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div className="booth-screen animate-fadeIn">
      {/* Ambient BG */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {/* Sign Out */}
      {onLogout && (
        <button
          className="topbar-btn"
          onClick={onLogout}
          style={{ position: 'absolute', top: 20, right: 20, zIndex: 20, color: 'var(--text-s)' }}
        >
          Sign Out
        </button>
      )}

      {/* Header */}
      <div className="booth-header animate-slideUp">
        <div className="booth-eyebrow">
          <span className="booth-eyebrow-dot" />
          Staff Terminal
        </div>
        <h1 className="booth-title">Select Your Booth</h1>
        <p className="booth-subtitle">
          Choose your station to begin managing the queue.
        </p>
      </div>

      {/* Booth Grid */}
      {themes.length === 0 ? (
        <div className="queue-empty animate-slideUp" style={{ width: '100%', maxWidth: 400 }}>
          <div className="queue-empty-icon">
            <CameraIcon />
          </div>
          <div className="queue-empty-text">
            <strong style={{ color: 'var(--text-s)' }}>No booths configured</strong><br />
            Add themes in the Admin settings to get started.
          </div>
        </div>
      ) : (
        <div className="booth-grid">
          {themes.map((theme, idx) => {
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            const myQueues = queueData[theme.name] || [];
            const waitingCount = myQueues.filter(q => q.status?.toLowerCase() === 'waiting').length;

            return (
              <button
                key={theme.id}
                className="booth-card animate-slideUp"
                style={{ animationDelay: `${idx * 0.08}s` }}
                onClick={() => onSelect(theme)}
              >
                <div className="booth-card-header">
                  <div
                    className="booth-icon-wrap"
                    style={{ background: accent.bg, borderColor: accent.border }}
                  >
                    <CameraIcon style={{ color: accent.text }} />
                  </div>
                  {waitingCount > 0 && (
                    <div className="booth-badge">{waitingCount}</div>
                  )}
                </div>

                <div className="booth-card-info">
                  <div className="booth-card-name">{theme.name}</div>
                  <div className="booth-card-sub">
                    <span className="booth-card-prefix" style={{ color: accent.text, borderColor: accent.border, background: accent.bg }}>
                      {theme.prefix || 'T'}
                    </span>
                    <div className="booth-card-status">
                      <span className="booth-status-dot" />
                      <span style={{ fontSize: 12, color: 'var(--s-session)', fontWeight: 600 }}> Active</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="booth-footer animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="booth-footer-line" />
        {today.toUpperCase()} · JJIKGO PHOTOBOOTH
        <div className="booth-footer-line" />
      </div>
    </div>
  );
}
