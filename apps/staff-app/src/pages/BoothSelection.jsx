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

export default function BoothSelection({ themes, onSelect }) {
    return (
        <div className="booth-screen animate-fadeIn">
            <div className="booth-logo">JJIKGO PHOTOBOOTH</div>

            <div className="animate-scaleIn" style={{ textAlign: 'center' }}>
                <h1 className="booth-title">Which booth are you at?</h1>
                <p className="booth-subtitle">Select your booth to start managing the queue</p>
            </div>

            {themes.length === 0 ? (
                <div style={{
                    color: 'var(--text-muted)', fontSize: 15, textAlign: 'center',
                    padding: '40px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
                }}>
                    <div style={{ fontSize: 48, opacity: 0.3 }}>🏚️</div>
                    <div style={{ fontWeight: 600 }}>No booths configured</div>
                    <div style={{ fontSize: 13, opacity: 0.6 }}>Add themes in the Admin settings</div>
                </div>
            ) : (
                <div className="booth-grid">
                    {themes.map((theme, idx) => (
                        <button
                            key={theme.id}
                            className="booth-card animate-fadeUp"
                            style={{ animationDelay: `${idx * 0.08}s` }}
                            onClick={() => onSelect(theme)}
                        >
                            {/* Colored top stripe */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                background: ACCENT_GRADIENTS[idx % ACCENT_GRADIENTS.length],
                                borderRadius: '20px 20px 0 0',
                            }} />

                            <div className="booth-card-icon">{getBoothIcon(theme)}</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div className="booth-card-name">{theme.name}</div>
                                <div className="booth-card-prefix">
                                    Prefix: {theme.prefix || 'T'}
                                </div>
                            </div>

                            {/* Arrow hint */}
                            <div style={{
                                position: 'absolute', bottom: 14, right: 16,
                                fontSize: 18, opacity: 0.2
                            }}>→</div>
                        </button>
                    ))}
                </div>
            )}

            <div style={{
                marginTop: 48, fontSize: 12, color: 'var(--text-muted)',
                fontWeight: 500, opacity: 0.5
            }}>
                Staff App · {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
    );
}
