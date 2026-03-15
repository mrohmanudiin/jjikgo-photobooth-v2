import React from 'react';

// Maps theme names/prefixes to icons
const BOOTH_ICONS = {
    'EL': '🛗',
    'VT': '📽️',
    'SM': '🛒',
    'VN': '🎵',
    'default': '📸',
};

function getBoothIcon(theme) {
    const prefix = (theme.prefix || '').toUpperCase();
    return BOOTH_ICONS[prefix] || BOOTH_ICONS['default'];
}

// Gradient accent colors per index
const ACCENT_GRADIENTS = [
    'linear-gradient(135deg, #6C63FF, #9C88FF)',
    'linear-gradient(135deg, #EC4899, #F472B6)',
    'linear-gradient(135deg, #10B981, #34D399)',
    'linear-gradient(135deg, #F59E0B, #FBBF24)',
    'linear-gradient(135deg, #3B82F6, #60A5FA)',
    'linear-gradient(135deg, #EF4444, #FC8181)',
];

export default function BoothSelection({ themes, queueData, onSelect }) {
    return (
        <div className="booth-screen animate-fadeIn">
            <div className="booth-logo">JJIKGO PHOTOBOOTH</div>

            <div className="animate-slideUp" style={{ textAlign: 'center' }}>
                <h1 className="booth-title">Which booth are you at?</h1>
                <p className="booth-subtitle">Select your booth to start managing the queue with high-fidelity precision.</p>
            </div>

            {themes.length === 0 ? (
                <div style={{
                    color: 'var(--text-m)', fontSize: 15, textAlign: 'center',
                    padding: '40px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
                }}>
                    <div style={{ fontSize: 48, opacity: 0.3 }}>🏚️</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>No booths configured</div>
                    <div style={{ fontSize: 13, opacity: 0.6 }}>Add themes in the Admin settings</div>
                </div>
            ) : (
                <div className="booth-grid">
                    {themes.map((theme, idx) => {
                        const myQueues = queueData[theme.name] || [];
                        const waitingCount = myQueues.filter(q => q.status?.toLowerCase() === 'waiting').length;

                        return (
                            <button
                                key={theme.id}
                                className="booth-card animate-slideUp"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                                onClick={() => onSelect(theme)}
                            >
                                {waitingCount > 0 && (
                                    <div className="booth-badge">
                                        {waitingCount}
                                    </div>
                                )}

                                <div className="booth-card-icon">{getBoothIcon(theme)}</div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div className="booth-card-name">{theme.name}</div>
                                    <div className="booth-card-prefix">
                                        {theme.prefix || 'T'}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div style={{
                marginTop: 64, fontSize: 11, color: 'var(--text-m)',
                fontWeight: 700, letterSpacing: '0.1em', opacity: 0.8
            }}>
                STAFF TERMINAL V.2.0 · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
            </div>
        </div>
    );
}
