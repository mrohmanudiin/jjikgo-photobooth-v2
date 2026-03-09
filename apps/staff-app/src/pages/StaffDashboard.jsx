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

// ─── Queue Card ────────────────────────────────────────────────────────────────
function QueueCard({ queue, theme, isActive }) {
    const sc = getStatusColor(queue.status);
    const isCalled = queue.status === 'called';

    return (
        <div
            className={`queue-card${isCalled ? ' queue-card-called' : ''}`}
            style={{
                borderColor: isActive ? 'var(--accent)' : (isCalled ? undefined : 'var(--border)'),
                background: isActive ? 'var(--accent-dim)' : (isCalled ? 'var(--called-bg)' : undefined),
            }}
        >
            {/* Queue number badge */}
            <div
                className="queue-number-badge"
                style={{ background: sc.bg, color: sc.text }}
            >
                {theme.prefix || 'T'}{String(queue.queue_number).padStart(2, '0')}
            </div>

            {/* Body */}
            <div className="queue-card-body">
                <div className="queue-customer-name">
                    {queue.transaction?.customer_name || 'Walk-in'}
                </div>
                <div className="queue-meta">
                    <span className="queue-meta-tag">
                        👥&nbsp;{queue.transaction?.people_count || 1} pax
                    </span>
                    <span
                        className="queue-status-pill"
                        style={{ background: sc.bg, color: sc.text }}
                    >
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: sc.dot, display: 'inline-block', flexShrink: 0
                        }} />
                        {getStatusLabel(queue.status)}
                    </span>
                </div>
            </div>

            {/* Waiting time */}
            <div className="queue-wait-time">
                {formatWaitingTime(queue.created_at)}
            </div>
        </div>
    );
}

// ─── Session Status Flow ───────────────────────────────────────────────────────
function StatusFlow({ currentStatus }) {
    const currentIdx = getFlowIndex(currentStatus);
    return (
        <div className="status-flow">
            {STATUS_FLOW.map((step, idx) => {
                const isDone = idx < currentIdx;
                const isActive = idx === currentIdx;
                return (
                    <div key={step.key} className="status-flow-step">
                        <div className="status-flow-node">
                            <div className={`status-flow-dot ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                                {step.icon}
                            </div>
                            <span className={`status-flow-label ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                                {step.label}
                            </span>
                        </div>
                        {idx < STATUS_FLOW.length - 1 && (
                            <div className={`status-flow-line ${isDone ? 'done' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Session Panel (right side) ────────────────────────────────────────────────
function SessionPanel({ activeQueue, theme, onAction, busy }) {
    if (!activeQueue) {
        return (
            <div className="session-panel">
                <div className="section-header">
                    <span className="section-title">Current Session</span>
                </div>
                <div className="session-empty" style={{ flex: 1 }}>
                    <div className="session-empty-icon">📷</div>
                    <div className="session-empty-title">No active session</div>
                    <div className="session-empty-sub">
                        Press CALL NEXT to bring a customer in
                    </div>
                </div>
            </div>
        );
    }

    const status = activeQueue.status?.toLowerCase();
    const customerName = activeQueue.transaction?.customer_name || 'Walk-in';
    const peopleCount = activeQueue.transaction?.people_count || 1;
    const queueLabel = `${theme.prefix || 'T'}${String(activeQueue.queue_number).padStart(2, '0')}`;

    // Which buttons to show
    const canStart = status === 'called';
    const canPrint = status === 'in_session';

    return (
        <div className="session-panel">
            <div className="section-header">
                <span className="section-title">Current Session</span>
                <span className="queue-count-badge">Active</span>
            </div>

            {/* Customer Card */}
            <div className="session-customer-card animate-scaleIn">
                <div className="session-queue-number">{queueLabel}</div>

                <div className="session-customer-row">
                    <div className="session-avatar">
                        {customerName[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <div className="session-customer-name">{customerName}</div>
                        <div className="session-customer-sub">
                            {theme.name} Booth
                        </div>
                    </div>
                </div>

                <div className="session-info-tags">
                    <div className="session-info-tag">
                        <span className="session-tag-label">People</span>
                        <span className="session-tag-value">👥 {peopleCount} pax</span>
                    </div>
                    <div className="session-info-tag">
                        <span className="session-tag-label">Theme</span>
                        <span className="session-tag-value">🎨 {theme.name}</span>
                    </div>
                    <div className="session-info-tag">
                        <span className="session-tag-label">Waiting</span>
                        <span className="session-tag-value">⏱ {formatWaitingTime(activeQueue.created_at)}</span>
                    </div>
                </div>
            </div>

            {/* Status Flow */}
            <div>
                <div className="section-header" style={{ marginBottom: 14 }}>
                    <span className="section-title">Status Flow</span>
                </div>
                <StatusFlow currentStatus={status} />
            </div>

            <hr className="sep" />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 70 }}>

                {/* START SESSION */}
                {canStart && (
                    <button
                        className="action-btn action-btn-start animate-fadeUp"
                        disabled={busy}
                        onClick={() => onAction('start')}
                    >
                        {busy === 'start' ? <><div className="spinner" /> Starting…</> : <>📸 START SESSION</>}
                    </button>
                )}



                {/* SEND TO PRINT */}
                {canPrint && (
                    <button
                        className="action-btn action-btn-print animate-fadeUp"
                        disabled={busy}
                        onClick={() => onAction('print')}
                    >
                        {busy === 'print'
                            ? <><div className="spinner" /> Sending…</>
                            : <>🖨️ SEND TO PRINT</>
                        }
                    </button>
                )}

            </div>

            {/* Status hint */}
            <div style={{
                fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
                fontWeight: 500, lineHeight: 1.6, marginTop: 10
            }}>
                {status === 'called' && '▶ Press START SESSION when the customer is ready to shoot'}
                {status === 'in_session' && '▶ Press SEND TO PRINT when the customer finishes their session'}
            </div>
        </div>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function StaffDashboard({ theme, onChangeBooth }) {
    const [queueData, setQueueData] = useState({});
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(null);  // 'call'|'start'|'finish'|'print'
    const [toast, setToast] = useState('');
    const toastTimer = useRef(null);

    // Derived: queues for this theme
    const myQueues = queueData[theme.name] || [];

    // Active queue = first called or in_session
    const activeQueue = myQueues.find(q =>
        ['called', 'in_session'].includes(q.status?.toLowerCase())
    ) || null;

    // Waiting queues
    const waitingQueues = myQueues.filter(q => q.status?.toLowerCase() === 'waiting');

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const refresh = useCallback(async () => {
        try {
            const data = await fetchQueue();
            setQueueData(data);
        } catch (e) {
            console.error('Fetch queue error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();

        // Polling every 5s as fallback
        const intervalId = setInterval(refresh, 5000);

        // Real-time via socket
        socket.on('queueUpdated', refresh);

        return () => {
            clearInterval(intervalId);
            socket.off('queueUpdated', refresh);
        };
    }, [refresh]);

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = (msg) => {
        setToast(msg);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 3000);
    };

    // ── Call Next ──────────────────────────────────────────────────────────────
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

    // ── Session Actions ────────────────────────────────────────────────────────
    const handleAction = async (action) => {
        if (!activeQueue || busy) return;
        setBusy(action);
        try {
            if (action === 'start') {
                await startSession(activeQueue.id, null);
                showToast('📸 Session started!');
            } else if (action === 'print') {
                await sendToPrint(activeQueue.id);
                showToast('🖨️ Session sent to cashier for printing!');
            }
            await refresh();
        } catch (e) {
            showToast(`❌ ${e?.response?.data?.error || 'Action failed'}`);
        } finally {
            setBusy(null);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="app-layout">

                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-brand">JJIKGO</div>
                    <div className="topbar-divider" />
                    <div className="topbar-booth">
                        <div className="topbar-booth-dot" />
                        <span className="topbar-booth-name">{theme.name} Booth</span>
                    </div>
                    <div className="topbar-spacer" />
                    <div className="topbar-live">
                        <div className="topbar-live-dot" />
                        LIVE
                    </div>
                    <TopbarClock />
                    <button className="topbar-change-btn" onClick={onChangeBooth}>
                        Change Booth
                    </button>
                </header>

                {/* Left: Queue Panel */}
                <main className="queue-panel">

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[
                            { label: 'Waiting', val: waitingQueues.length, color: 'var(--waiting-fg)' },
                            { label: 'In Session', val: activeQueue ? 1 : 0, color: 'var(--session-fg)' },
                            { label: 'Total Today', val: myQueues.length, color: 'var(--accent)' },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                flex: 1,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '16px 18px',
                            }}>
                                <div style={{
                                    fontSize: 30, fontWeight: 900,
                                    color: stat.color, letterSpacing: '-0.04em', lineHeight: 1,
                                }}>
                                    {stat.val}
                                </div>
                                <div style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: 'var(--text-muted)', textTransform: 'uppercase',
                                    letterSpacing: '0.08em', marginTop: 4
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CALL NEXT button */}
                    <div>
                        <div className="section-header" style={{ marginBottom: 12 }}>
                            <span className="section-title">Queue Control</span>
                            {waitingQueues.length > 0 && (
                                <span className="queue-count-badge">{waitingQueues.length} waiting</span>
                            )}
                        </div>
                        <button
                            id="call-next-btn"
                            className="call-next-btn"
                            disabled={!!busy || waitingQueues.length === 0 || !!activeQueue}
                            onClick={handleCallNext}
                        >
                            {busy === 'call'
                                ? <><div className="spinner" /> Calling…</>
                                : <>
                                    <span className="call-next-icon">📣</span>
                                    CALL NEXT
                                </>
                            }
                        </button>
                        {activeQueue && (
                            <div style={{
                                marginTop: 8, fontSize: 12, color: 'var(--text-muted)',
                                textAlign: 'center', fontWeight: 500
                            }}>
                                Finish the current session before calling next
                            </div>
                        )}
                    </div>

                    {/* Waiting queue list */}
                    <div>
                        <div className="section-header" style={{ marginBottom: 12 }}>
                            <span className="section-title">Waiting Queue</span>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="skeleton" style={{ height: 82, animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                        ) : waitingQueues.length === 0 ? (
                            <div className="queue-empty">
                                <div className="queue-empty-icon">🎉</div>
                                <div className="queue-empty-text">Queue is empty</div>
                            </div>
                        ) : (
                            <div className="queue-list">
                                {waitingQueues.map((q, idx) => (
                                    <div key={q.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <QueueCard queue={q} theme={theme} isActive={false} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Called/Active queue (shown in queue list too) */}
                    {activeQueue && (
                        <div>
                            <div className="section-header" style={{ marginBottom: 12 }}>
                                <span className="section-title">Currently Active</span>
                            </div>
                            <QueueCard queue={activeQueue} theme={theme} isActive />
                        </div>
                    )}

                </main>

                {/* Right: Session Panel */}
                <aside>
                    <SessionPanel
                        activeQueue={activeQueue}
                        theme={theme}
                        onAction={handleAction}
                        busy={busy}
                    />
                </aside>

            </div>

            {/* Toast */}
            <Toast message={toast} />
        </>
    );
}
