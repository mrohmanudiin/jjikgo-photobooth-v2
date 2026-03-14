import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ShoppingCart, LogOut, DollarSign, X } from 'lucide-react';

export default function ShiftModal({ isOpen, onClose }) {
    const { currentShift, addExpense, endShift } = useStore();
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [endingCash, setEndingCash] = useState('');
    const [mode, setMode] = useState('menu'); // 'menu', 'expense', 'end_shift'
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setLoading(true);
        await addExpense(parseFloat(expenseAmount), expenseDesc);
        setLoading(false);
        setExpenseAmount('');
        setExpenseDesc('');
        setMode('menu');
    };

    const handleEndShift = async (e) => {
        e.preventDefault();
        setLoading(true);
        await endShift(parseFloat(endingCash));
        setLoading(false);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
            <div className="animate-scaleIn" style={{
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 400,
                padding: 32, boxShadow: '0 32px 64px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800 }}>Shift Management</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}><X size={20}/></button>
                </div>

                {mode === 'menu' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ 
                            background: '#F5F5F7', borderRadius: 12, padding: 16, marginBottom: 12,
                            display: 'flex', justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Starting Cash</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>Rp {currentShift?.starting_cash?.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expenses</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#FF3B30' }}>- Rp {currentShift?.total_expenses?.toLocaleString()}</div>
                            </div>
                        </div>

                        <button onClick={() => setMode('expense')} className="btn" style={{ background: '#F5F5F7', justifyContent: 'flex-start', padding: 16, height: 'auto' }}>
                            <div style={{ background: 'white', padding: 8, borderRadius: 8, color: '#FF9500', marginRight: 12 }}><DollarSign size={20}/></div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700 }}>Record Expense</div>
                                <div style={{ fontSize: 12, color: '#8E8E93' }}>Buy supplies or operational costs</div>
                            </div>
                        </button>

                        <button onClick={() => setMode('end_shift')} className="btn" style={{ background: '#FFF1F0', color: '#FF3B30', justifyContent: 'flex-start', padding: 16, height: 'auto', border: '1px solid #FFCCC7' }}>
                            <div style={{ background: 'white', padding: 8, borderRadius: 8, color: '#FF3B30', marginRight: 12 }}><LogOut size={20}/></div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700 }}>End Shift</div>
                                <div style={{ fontSize: 12, color: '#FF3B30', opacity: 0.7 }}>Close register and log out</div>
                            </div>
                        </button>
                    </div>
                )}

                {mode === 'expense' && (
                    <form onSubmit={handleAddExpense}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 6 }}>Amount</label>
                            <input type="number" className="input" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required autoFocus placeholder="0" />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 6 }}>Description</label>
                            <input type="text" className="input" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required placeholder="e.g. Buying tissues" />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" onClick={() => setMode('menu')} className="btn" style={{ flex: 1, background: '#F5F5F7' }}>Cancel</button>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>{loading ? 'Saving...' : 'Save Expense'}</button>
                        </div>
                    </form>
                )}

                {mode === 'end_shift' && (
                    <form onSubmit={handleEndShift}>
                        <p style={{ fontSize: 14, color: '#111', marginBottom: 20 }}>
                            Please count the final cash in your register before ending the shift.
                        </p>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 6 }}>Final Cash Balance</label>
                            <input type="number" className="input" value={endingCash} onChange={e => setEndingCash(e.target.value)} required autoFocus placeholder="0" />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" onClick={() => setMode('menu')} className="btn" style={{ flex: 1, background: '#F5F5F7' }}>Cancel</button>
                            <button type="submit" disabled={loading} className="btn" style={{ flex: 1, background: '#FF3B30', color: 'white' }}>{loading ? 'Closing...' : 'Confirm End Shift'}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
