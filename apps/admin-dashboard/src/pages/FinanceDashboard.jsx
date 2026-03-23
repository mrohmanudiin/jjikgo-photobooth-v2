import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
    CircleDollarSign,
    TrendingUp,
    CreditCard,
    Activity,
    CalendarDays,
    Download,
    FileSpreadsheet,
    ArrowUpRight,
    Loader2,
    Target,
    X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { cn } from '../lib/utils';
import api from '../utils/api';
import { useBranch } from '../contexts/BranchContext';
import { format, subDays, startOfWeek, startOfMonth, parseISO, getHours } from 'date-fns';

function getDateRange(range, customFrom, customTo) {
    const now = new Date();
    switch (range) {
        case 'Today':
            return { from: format(now, 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
        case 'Yesterday':
            return { from: format(subDays(now, 1), 'yyyy-MM-dd'), to: format(subDays(now, 1), 'yyyy-MM-dd') };
        case '7 Days':
            return { from: format(subDays(now, 7), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
        case '30 Days':
            return { from: format(subDays(now, 30), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
        case 'This Month':
            return { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
        case 'Custom':
            return { from: customFrom, to: customTo };
        default:
            return {};
    }
}

function StatCard({ title, value, subtext, icon: Icon, trend }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {trend !== undefined && trend !== null && (
                        <span className={cn("inline-flex items-center font-medium mr-1", trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {trend >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowUpRight className="h-3 w-3 mr-0.5 rotate-90" />}
                            {Math.abs(trend)}%
                        </span>
                    )}
                    <span>{subtext}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export function FinanceDashboard() {
    const { selectedBranch } = useBranch();
    const [dateRange, setDateRange] = useState('Today');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [targets, setTargets] = useState({ daily: 1000000, monthly: 30000000, yearly: 360000000 });

    const fetchSettings = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (selectedBranch) params.append('branchFilter', selectedBranch.id);
            const { data } = await api.get(`/studio/settings?${params}`);
            setTargets({
                daily: Number(data.daily_target_revenue) || 1000000,
                monthly: Number(data.monthly_target_revenue) || 30000000,
                yearly: Number(data.yearly_target_revenue) || 360000000,
            });
        } catch(err) {
            console.error('Failed to fetch settings', err);
        }
    }, [selectedBranch]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSaveTargets = async () => {
        try {
            const payloadDaily = { key: 'daily_target_revenue', value: targets.daily };
            const payloadMonthly = { key: 'monthly_target_revenue', value: targets.monthly };
            const payloadYearly = { key: 'yearly_target_revenue', value: targets.yearly };

            if (selectedBranch) {
                payloadDaily.branch_id = selectedBranch.id;
                payloadMonthly.branch_id = selectedBranch.id;
                payloadYearly.branch_id = selectedBranch.id;
            }

            await Promise.all([
                api.post('/studio/settings', payloadDaily),
                api.post('/studio/settings', payloadMonthly),
                api.post('/studio/settings', payloadYearly),
            ]);
            setShowTargetModal(false);
            fetchSettings();
        } catch(e) {
            console.error(e);
            alert('Failed to save targets');
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedBranch) params.append('branch_id', selectedBranch.id);
            const rangeObj = getDateRange(dateRange, null, null);
            if (rangeObj.from) params.append('date_from', rangeObj.from);
            if (rangeObj.to) params.append('date_to', rangeObj.to);

            const { data } = await api.get(`/transactions?${params}`);
            // Only consider 'done' transactions for finance 
            setTransactions(data.filter(t => t.status === 'done'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, dateRange]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        let isMounted = true;
        import('../utils/socket').then(({ socket }) => {
            if (!isMounted) return;
            const handleUpdate = () => {
                fetchTransactions();
            };
            socket.on('queueUpdated', handleUpdate);
            socket.on('adminEvent', handleUpdate);
            
            return () => {
                socket.off('queueUpdated', handleUpdate);
                socket.off('adminEvent', handleUpdate);
            };
        });
        return () => { isMounted = false; };
    }, [fetchTransactions]);

    const {
        totalRevenue,
        totalTransactions,
        avgCheckSize,
        netProfit,
        paymentMethodData,
        peakHourHeatmapData,
        themeRevenueData,
        recentLargeTransactions
    } = useMemo(() => {
        let rev = 0;
        const methods = { qris: 0, edc: 0, transfer: 0, cash: 0 };
        const peakMap = Array.from({ length: 14 }).map((_, i) => ({ time: `${i + 9}:00`, load: 0, count: 0 })); // 9 AM to 10 PM
        const themes = {};

        transactions.forEach(t => {
            const val = Number(t.total) || 0;
            rev += val;
            
            // Normalize payment method
            let pm = t.payment_method?.toLowerCase() || 'cash';
            if (pm.includes('qris')) pm = 'qris';
            else if (pm.includes('edc') || pm.includes('card')) pm = 'edc';
            else if (pm.includes('transfer')) pm = 'transfer';
            else pm = 'cash';

            if (methods[pm] !== undefined) {
                methods[pm] += val;
            } else {
                methods.cash += val; // fallback
            }

            const hour = getHours(parseISO(t.created_at));
            if (hour >= 9 && hour <= 22) {
                peakMap[hour - 9].count += 1;
            }

            const themeName = t.theme || 'Cafe Only';
            themes[themeName] = (themes[themeName] || 0) + val;
        });

        const maxHourCount = Math.max(...peakMap.map(p => p.count), 1);
        peakMap.forEach(p => {
            p.load = Math.round((p.count / maxHourCount) * 100);
        });

        const avg = transactions.length > 0 ? rev / transactions.length : 0;
        const profit = rev * 0.68; // Arbitrary 68% margin for est. net profit

        const tRevenueData = Object.entries(themes).map(([name, revenue]) => ({ name, revenue })).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
        const pMethodData = [
            { name: 'QRIS', value: methods.qris, color: 'hsl(var(--primary))' },
            { name: 'EDC (Card)', value: methods.edc, color: '#3b82f6' },
            { name: 'Transfer', value: methods.transfer, color: '#8b5cf6' },
            { name: 'Cash', value: methods.cash, color: '#10b981' },
        ];

        const rLarge = [...transactions].sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 5).map(t => ({
            id: t.invoice_number,
            amount: Number(t.total),
            method: t.payment_method,
            time: format(parseISO(t.created_at), 'HH:mm'),
            cust: `${t.customer_name || 'Walk-in'} (${t.people_count || 1} pax)`
        }));

        return {
            totalRevenue: rev,
            totalTransactions: transactions.length,
            avgCheckSize: avg,
            netProfit: profit,
            paymentMethodData: pMethodData,
            peakHourHeatmapData: peakMap,
            themeRevenueData: tRevenueData,
            recentLargeTransactions: rLarge
        };
    }, [transactions]);


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance Analytics</h2>
                    <p className="text-muted-foreground mt-1">Deep dive into financial metrics, revenue breakdown, and trends. {selectedBranch && <span className="text-primary font-medium">— {selectedBranch.name}</span>}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTargetModal(true)} className="h-8">
                        <Target className="mr-2 h-4 w-4" /> Set Targets
                    </Button>
                    <div className="flex items-center border rounded-md p-1 bg-muted/50">
                        {['Today', '7 Days', '30 Days', 'This Month'].map(range => (
                            <Button
                                key={range}
                                variant={dateRange === range ? "secondary" : "ghost"}
                                size="sm"
                                className="h-8 text-xs px-3"
                                onClick={() => setDateRange(range)}
                            >
                                {range}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} subtext="Collected" icon={CircleDollarSign} />
                    <StatCard title="Total Transactions" value={totalTransactions} subtext="Successful payments" icon={Activity} />
                    <StatCard title="Avg Check Size" value={formatCurrency(avgCheckSize)} subtext="Per transaction" icon={CreditCard} />
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{dateRange === 'Today' ? 'Daily Target' : 'Revenue Target'}</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Target className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(totalRevenue / (dateRange === 'Today' ? targets.daily : targets.monthly) * 100).toFixed(1)}%</div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                                <div 
                                    className="bg-primary h-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, Math.max(0, (totalRevenue / (dateRange === 'Today' ? targets.daily : targets.monthly) * 100)))}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                {formatCurrency(totalRevenue)} / {formatCurrency(dateRange === 'Today' ? targets.daily : targets.monthly)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="col-span-4 max-h-[450px]">
                        <CardHeader>
                            <CardTitle>Peak Hour Heatmap</CardTitle>
                            <CardDescription>Customer density and revenue generation by hour.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={peakHourHeatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip
                                        formatter={(value) => [`${value}% Capacity`, 'Load']}
                                        labelFormatter={(v) => `Time: ${v}`}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="load" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>Breakdown of transaction channels</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentMethodData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(1)}M`} />
                                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={70} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        formatter={(v) => formatCurrency(v)}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                                        {paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue By Theme</CardTitle>
                            <CardDescription>Performance comparison across available themes</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {themeRevenueData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data for selected period</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={themeRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            formatter={(v) => formatCurrency(v)}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Large Transactions</CardTitle>
                            <CardDescription>Highest payments for the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentLargeTransactions.length === 0 && (
                                    <div className="text-center py-8 text-sm text-muted-foreground">No transactions available</div>
                                )}
                                {recentLargeTransactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{tx.cust}</p>
                                                <p className="text-xs text-muted-foreground">{tx.id} • {tx.method} • {tx.time}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">{formatCurrency(tx.amount)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                </>
            )}
            {showTargetModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card w-full max-w-md rounded-xl border shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-semibold">Set Revenue Targets</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowTargetModal(false)} className="h-8 w-8 p-0 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Daily Target (Rp)</label>
                                <input 
                                    type="number" 
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    value={targets.daily}
                                    onChange={(e) => setTargets({...targets, daily: Number(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monthly Target (Rp)</label>
                                <input 
                                    type="number" 
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    value={targets.monthly}
                                    onChange={(e) => setTargets({...targets, monthly: Number(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Yearly Target (Rp)</label>
                                <input 
                                    type="number" 
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    value={targets.yearly}
                                    onChange={(e) => setTargets({...targets, yearly: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t gap-2 bg-muted/40">
                            <Button variant="outline" onClick={() => setShowTargetModal(false)}>Cancel</Button>
                            <Button onClick={handleSaveTargets}>Save Targets</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
