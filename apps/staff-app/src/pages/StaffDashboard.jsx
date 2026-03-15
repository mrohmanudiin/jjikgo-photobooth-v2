import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchQueue, callNext, startSession, sendToPrint, socket } from '../utils/api';
import { formatWaitingTime, getStatusLabel, getStatusColor } from '../utils/format';

// ─── Status flow config ────────────────────────────────────────────────────────
const STATUS_FLOW = [
    { key: 'waiting', label: 'Waiting', icon: '⏳' },
    { key: 'called', label: 'Called', icon: '📣' },
    { key: 'in_session', label: 'Session', icon: '📸' },
    { key: 'print_requested', label: 'To Print', icon: '🖨️' },
    { key: 'done', label: 'Done', icon: '✅' },
];

function getFlowIndex(status) {
    return STATUS_FLOW.findIndex(s => s.key === status?.toLowerCase());
}

// ─── Topbar Clock ──────────────────────────────────────────────────────────────
function TopbarClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <span className="topbar-time">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
    );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message }) {
    if (!message) return null;
    return <div className="toast">{message}</div>;
}

// ─── Queue Card Component ───────────────────────────────────────────────────
function QueueCard({ queue, theme, isActive }) {
    const isCalled = queue.status === 'called';
    
    // Custom colors for the badge based on status
    const getSc = (status) => {
        switch(status.toLowerCase()) {
            case 'waiting': return { bg: 'rgba(255, 176, 0, 0.1)', text: '#FFB000' };
            case 'called': return { bg: 'rgba(0, 209, 255, 0.1)', text: '#00D1FF' };
            case 'in_session': return { bg: 'rgba(0, 255, 148, 0.1)', text: '#00FF94' };
            default: return { bg: 'rgba(255,255,255,0.05)', text: '#fff' };
        }
    };
    const sc = getSc(queue.status);

    return (
        <div 
            className="queue-card animate-slideUp"
            style={{ 
                borderColor: isActive ? 'var(--accent-cyan)' : undefined,
                background: isActive ? 'rgba(0, 245, 255, 0.05)' : undefined,
                boxShadow: isActive ? '0 0 20px rgba(0, 245, 255, 0.1)' : undefined
            }}
        >
            <div className="queue-number-badge" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.text}33` }}>
                {theme.prefix || 'T'}{String(queue.queue_number).padStart(2, '0')}
            </div>

            <div style={{ flex: 1 }}>
                <div className="queue-customer-name">
                    {queue.transaction?.customer_name || 'Walk-in'}
                </div>
                <div className="queue-meta">
                    <span className="queue-meta-tag">👥 {queue.transaction?.people_count || 1} pax</span>
                    <div className="queue-status-pill" style={{ background: sc.bg, color: sc.text }}>
                         <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.text }} />
                         {getStatusLabel(queue.status)}
                    </div>
                </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-m)', textAlign: 'right' }}>
                {formatWaitingTime(queue.created_at)}
            </div>
        </div>
    );
}

// ─── Status Flow Component ───────────────────────────────────────────────────
function StatusFlow({ currentStatus }) {
    const currentIdx = getFlowIndex(currentStatus);
    return (
        <div className="status-flow">
            {STATUS_FLOW.map((step, idx) => {
                const isDone = idx < currentIdx;
                const isActive = idx === currentIdx;
                return (
                    <React.Fragment key={step.key}>
                        <div className="status-flow-node">
                            <div className={`status-flow-dot ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                                {step.icon}
                            </div>
                        </div>
                        {idx < STATUS_FLOW.length - 1 && (
                            <div className={`status-flow-line ${isDone ? 'done' : ''}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Session Panel Component ──────────────────────────────────────────────────
function SessionPanel({ activeQueue, theme, onAction, busy }) {
    if (!activeQueue) {
        return (
            <div className="session-panel">
                <span className="section-title">Terminal Focus</span>
                <div className="panel-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 24 }}>
                    <div style={{ fontSize: 64, filter: 'grayscale(1) opacity(0.2)' }}>📸</div>
                    <div>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Ready for Transfer</h3>
                        <p style={{ color: 'var(--text-s)', fontSize: 14 }}>Call the next customer from the queue<br/>to begin a new session.</p>
                    </div>
                </div>
            </div>
        );
    }

    const status = activeQueue.status?.toLowerCase();
    const customerName = activeQueue.transaction?.customer_name || 'Walk-in';
    const queueLabel = `${theme.prefix || 'T'}${String(activeQueue.queue_number).padStart(2, '0')}`;

    return (
        <div className="session-panel">
            <span className="section-title">Active Monitoring</span>
            
            <div className="session-customer-card animate-slideUp">
                <div className="session-queue-number">{queueLabel}</div>
                <div className="session-customer-name">{customerName}</div>
                
                <div className="session-info-tags">
                    <div className="session-info-tag">
                        <span className="session-tag-label">Occupancy</span>
                        <span className="session-tag-value">👥 {activeQueue.transaction?.people_count || 1} People</span>
                    </div>
                    <div className="session-info-tag">
                        <span className="session-tag-label">Theme Preset</span>
                        <span className="session-tag-value">🎨 {theme.name}</span>
                    </div>
                </div>

                <div style={{ marginTop: 40 }}>
                    <span className="section-title" style={{ marginBottom: 16 }}>Session Progress</span>
                    <StatusFlow currentStatus={status} />
                </div>
            </div>

            <div className="panel-card" style={{ marginTop: 'auto' }}>
                <span className="section-title">Control Interface</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {status === 'called' && (
                        <button className="action-btn action-btn-start" disabled={!!busy} onClick={() => onAction('start')}>
                            {busy === 'start' ? <div className="spinner" /> : '📸 START SESSION'}
                        </button>
                    )}
                    {status === 'in_session' && (
                        <button className="action-btn action-btn-print" disabled={!!busy} onClick={() => onAction('print')}>
                            {busy === 'print' ? <div className="spinner" /> : '🖨️ TRANSFER TO PRINT'}
                        </button>
                    )}
                    
                    <div style={{ fontSize: 12, color: 'var(--text-m)', textAlign: 'center', fontWeight: 600 }}>
                        {status === 'called' ? 'CUSTOMER ARRIVED? TRIGGER SESSION START' : 'SESSION COMPLETE? SEND TO PRINT STATION'}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Staff Dashboard ──────────────────────────────────────────────────────
export default function StaffDashboard({ theme, queueData, loading, refresh, onChangeBooth }) {
    const [busy, setBusy] = useState(null);
    const [toast, setToast] = useState('');
    const toastTimer = useRef(null);

    const myQueues = queueData[theme.name] || [];
    const activeQueue = myQueues.find(q => ['called', 'in_session'].includes(q.status?.toLowerCase())) || null;
    const waitingQueues = myQueues.filter(q => q.status?.toLowerCase() === 'waiting');

    const showToast = (msg) => {
        setToast(msg);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 3000);
    };

    const handleCallNext = async () => {
        if (busy || waitingQueues.length === 0) return;
        setBusy('call');
        try {
            await callNext(theme.id);
            await refresh();
            showToast('📣 Next customer called!');
        } catch (e) {
            showToast('❌ Failed to call next');
        } finally {
            setBusy(null);
        }
    };

    const handleAction = async (action) => {
        if (!activeQueue || busy) return;
        setBusy(action);
        try {
            if (action === 'start') {
                await startSession(activeQueue.id, null);
                showToast('📸 Session started!');
            } else if (action === 'print') {
                await sendToPrint(activeQueue.id);
                showToast('🖨️ Transferred to print station!');
            }
            await refresh();
        } catch (e) {
            showToast(`❌ Action failed`);
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="app-layout">
                <header className="topbar">
                    <div className="topbar-brand">
                        <img src="/logo.png" alt="JJIKGO" style={{ height: 32, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div className="topbar-divider" />
                    <div className="topbar-booth">
                        <div className="topbar-booth-dot" />
                        <span className="topbar-booth-name">{theme.name} STATION</span>
                    </div>
                    <div className="topbar-spacer" />
                    <div className="topbar-live"><div className="topbar-booth-dot" /> SIGNAL: STABLE</div>
                    <TopbarClock />
                    <button className="topbar-change-btn" onClick={onChangeBooth}>SWITCH STATION</button>
                </header>

                <main className="queue-panel">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-value" style={{ color: 'var(--s-waiting)' }}>{waitingQueues.length}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value" style={{ color: 'var(--s-session)' }}>{activeQueue ? 1 : 0}</span>
                            <span className="stat-label">Active</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value" style={{ color: 'var(--accent-indigo)' }}>{myQueues.length}</span>
                            <span className="stat-label">Total Cycle</span>
                        </div>
                    </div>

                    <div className="panel-card">
                        <span className="section-title">Command Center</span>
                        <button className="call-next-btn" disabled={!!busy || waitingQueues.length === 0 || !!activeQueue} onClick={handleCallNext}>
                            {busy === 'call' ? <div className="spinner" /> : '📣 INITIATE NEXT CALL'}
                        </button>
                        {activeQueue && (
                            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-m)', textAlign: 'center', fontWeight: 700 }}>
                                TERMINAL OCCUPIED. COMPLETE CURRENT SESSION.
                            </div>
                        )}
                    </div>

                    <div className="panel-card" style={{ flex: 1, minHeight: 400 }}>
                        <span className="section-title">Queue Stream</span>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 20 }} />)}
                            </div>
                        ) : waitingQueues.length === 0 ? (
                            <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.5 }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>🌈</div>
                                <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stream Empty</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {waitingQueues.map(q => <QueueCard key={q.id} queue={q} theme={theme} />)}
                            </div>
                        )}
                    </div>
                </main>

                <aside>
                    <SessionPanel activeQueue={activeQueue} theme={theme} onAction={handleAction} busy={busy} />
                </aside>
            </div>

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
