import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Play, DollarSign, Wallet } from 'lucide-react';

export default function ShiftOverlay() {
    const { currentShift, startShift, user, branch } = useStore();
    const [startingCash, setStartingCash] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (currentShift) return null;

    const handleStart = async (e) => {
        e.preventDefault();
        if (!startingCash) return setError('Please enter starting cash');
        
        setError('');
        setLoading(true);
        const result = await startShift(parseFloat(startingCash));
        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
        }}>
            <div className="animate-fadeIn" style={{
                background: 'white',
                borderRadius: 24,
                width: '100%',
                maxWidth: 400,
                padding: '40px 32px',
                textAlign: 'center',
                boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: '#111',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                }}>
                    <Play size={28} color="white" fill="white" />
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                    Start Your Shift
                </h2>
                <p style={{ fontSize: 14, color: '#8E8E93', marginBottom: 32 }}>
                    Welcome, <strong>{user?.full_name}</strong>!<br />
                    Please record the starting cash in your register at <strong>{branch?.name}</strong>.
                </p>

                <form onSubmit={handleStart}>
                    <div style={{ marginBottom: 24, textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Opening Balance (Cash)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#111', fontWeight: 700 }}>
                                Rp
                            </div>
                            <input
                                type="number"
                                className="input"
                                placeholder="0"
                                value={startingCash}
                                onChange={(e) => setStartingCash(e.target.value)}
                                style={{ paddingLeft: 44, fontSize: 18, fontWeight: 700 }}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: '#FFF1F0', border: '1px solid #FFCCC7', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FF3B30', marginBottom: 20 }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '16px', borderRadius: 14, fontSize: 16 }}
                    >
                        {loading ? 'Starting...' : 'Open Shift'}
                    </button>
                </form>

                <div style={{ marginTop: 24, fontSize: 12, color: '#C7C7CC' }}>
                    Current Time: {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}
