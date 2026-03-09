import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackQueueApi } from '../utils/api';
import { Clock, User, Users, Palette, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function QueueTracking() {
    const { queueNumber } = useParams();
    const [queueData, setQueueData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchQueueStatus = async () => {
        try {
            const data = await trackQueueApi(queueNumber);
            setQueueData(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Queue not found.');
            setQueueData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueueStatus();
        const interval = setInterval(fetchQueueStatus, 5000);
        return () => clearInterval(interval);
    }, [queueNumber]);

    if (loading && !queueData) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                <div className="loader" style={{ margin: '0 auto', marginBottom: 16 }}></div>
                <h2 style={{ color: '#8E8E93' }}>Loading Queue Info...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <AlertCircle size={48} color="#FF3B30" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 8 }}>Oops!</h2>
                <p style={{ fontSize: 16, color: '#8E8E93' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ marginTop: 24, padding: '12px 24px', background: '#111', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 16 }}
                >
                    Refresh
                </button>
            </div>
        );
    }

    const getStatusInfo = (status) => {
        switch (status) {
            case 'waiting': return { text: 'Waiting', color: '#FF9500', bg: '#FFF8EE', icon: <Clock size={20} /> };
            case 'called': return { text: 'Called', color: '#007AFF', bg: '#E5F1FF', icon: <AlertCircle size={20} /> };
            case 'in_session': return { text: 'In Session', color: '#007AFF', bg: '#E5F1FF', icon: <AlertCircle size={20} /> };
            case 'print_requested': return { text: 'Print Requested', color: '#EC4899', bg: '#FDF2F8', icon: <Clock size={20} /> };
            case 'printing': return { text: 'Printing', color: '#34C759', bg: '#EAFBEE', icon: <Clock size={20} /> };
            case 'done': return { text: 'Finished', color: '#155724', bg: '#F0FFF4', icon: <CheckCircle2 size={20} /> };
            default: return { text: status, color: '#111', bg: '#F2F2F7', icon: <Clock size={20} /> };
        }
    };

    const statusInfo = getStatusInfo(queueData.status);
    const isWaiting = queueData.status === 'waiting';

    return (
        <div style={{
            fontFamily: 'Inter, sans-serif',
            minHeight: '100vh',
            background: '#F5F5F7',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: 420,
                background: '#FFF',
                borderRadius: 24,
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '32px 24px', textAlign: 'center', background: '#111', color: '#FFF' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8E8E93', marginBottom: 8 }}>Queue Number</div>
                    <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{queueData.queueNumber}</div>
                </div>

                <div style={{ padding: 24 }}>
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: 16,
                        background: '#FAFAFA', padding: 20, borderRadius: 16, marginBottom: 24
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ background: '#EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} color="#111" />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#8E8E93', fontWeight: 600 }}>Customer</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{queueData.customerName || 'Walk-in'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ background: '#EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Palette size={20} color="#111" />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#8E8E93', fontWeight: 600 }}>Theme</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{queueData.theme}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ background: '#EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={20} color="#111" />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#8E8E93', fontWeight: 600 }}>People</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{queueData.people}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Current Status</div>

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: statusInfo.bg, color: statusInfo.color,
                            padding: '12px 24px', borderRadius: 100,
                            fontSize: 18, fontWeight: 800
                        }}>
                            {statusInfo.icon} {statusInfo.text}
                        </div>

                        {isWaiting && (
                            <div style={{ marginTop: 24, padding: 20, background: '#F2F2F7', borderRadius: 16 }}>
                                <div style={{ fontSize: 14, color: '#636366', fontWeight: 600, marginBottom: 8 }}>People Ahead</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#111', lineHeight: 1 }}>{queueData.peopleAhead}</div>
                                <p style={{ fontSize: 13, color: '#8E8E93', marginTop: 12, lineHeight: 1.4, fontWeight: 500 }}>
                                    Please wait until your number is called. Estimated waiting time is ~{Math.max(queueData.peopleAhead * 8, 5)} minutes.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div style={{ marginTop: 24, fontSize: 12, color: '#C7C7CC', fontWeight: 600 }}>
                Auto-updates every 5s
            </div>
        </div>
    );
}
