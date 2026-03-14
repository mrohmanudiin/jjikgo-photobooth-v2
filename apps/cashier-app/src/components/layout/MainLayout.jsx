import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ShiftOverlay from '../shift/ShiftOverlay';
import { usePrintAlerts } from '../../App';
import { useStore } from '../../store/useStore';

// ─── Print Alert Banner ───────────────────────────────────────────────────────
function PrintAlertBanner() {
    const { alerts, dismissAlert } = usePrintAlerts();
    const confirmPrint = useStore((s) => s.confirmPrint);
    const navigate = useNavigate();

    if (alerts.length === 0) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #F0C050, #FBBF24)',
            borderBottom: '2px solid #D97706',
            padding: '0',
            zIndex: 200,
        }}>
            {alerts.map((alert, idx) => (
                <div
                    key={alert.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '12px 20px',
                        borderBottom: idx < alerts.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                        animation: 'slideDown 0.3s cubic-bezier(0.22,1,0.36,1) both',
                    }}
                >
                    {/* Icon */}
                    <div style={{
                        fontSize: 22, flexShrink: 0,
                        animation: 'pulse 1s ease infinite',
                    }}>
                        🖨️
                    </div>

                    {/* Message */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#111', letterSpacing: '-0.01em' }}>
                            Print Request — {alert.queueNumber} · {alert.customerName}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontWeight: 500, marginTop: 1 }}>
                            From <strong>{alert.themeName} Booth</strong> · Staff has sent photos for printing
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                            onClick={() => {
                                navigate('/queue');
                                dismissAlert(alert.id);
                            }}
                            style={{
                                background: '#111',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 16px',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            View Queue →
                        </button>
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            style={{
                                background: 'rgba(0,0,0,0.15)',
                                color: '#111',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 12px',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                            title="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50%       { transform: scale(1.15); }
                }
            `}</style>
        </div>
    );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function MainLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
            <ShiftOverlay />
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Topbar />
                <PrintAlertBanner />
                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    <Outlet />
                </main>
                <footer style={{
                    textAlign: 'center',
                    padding: '10px 24px',
                    fontSize: 11,
                    color: '#C7C7CC',
                    borderTop: '1px solid #E5E5EA',
                    background: 'white',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                }}>
                    Korean Vibes Photobooth — Serang
                </footer>
            </div>
        </div>
    );
}
