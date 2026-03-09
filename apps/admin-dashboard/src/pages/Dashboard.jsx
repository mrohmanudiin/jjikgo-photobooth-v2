import React, { useState, useEffect } from 'react';
import {
    CircleDollarSign,
    Users,
    Camera,
    Printer,
    MonitorPlay,
    Clock,
    ArrowUpRight,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Wifi,
    Server,
    Activity,
    Target,
    Zap,
    QrCode,
    UserPlus,
    Pencil,
    Check,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const hourlyRevenueData = [
    { time: '10:00', revenue: 150 },
    { time: '11:00', revenue: 300 },
    { time: '12:00', revenue: 450 },
    { time: '13:00', revenue: 600 },
    { time: '14:00', revenue: 900 },
    { time: '15:00', revenue: 750 },
    { time: '16:00', revenue: 1200 },
    { time: '17:00', revenue: 1500 },
    { time: '18:00', revenue: 2100 },
    { time: '19:00', revenue: 3000 },
    { time: '20:00', revenue: 2500 },
];

const themeBreakdownData = [
    { name: 'Elevator', value: 35, color: '#6366f1' },
    { name: 'Vintage', value: 25, color: '#10b981' },
    { name: 'Supermarket', value: 20, color: '#f59e0b' },
    { name: 'Y2K Subway', value: 12, color: '#ec4899' },
    { name: 'Self Studio', value: 8, color: '#8b5cf6' },
];

function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const greeting = hours < 12 ? 'Selamat Pagi' : hours < 15 ? 'Selamat Siang' : hours < 18 ? 'Selamat Sore' : 'Selamat Malam';

    return (
        <div className="text-right">
            <p className="text-sm text-muted-foreground">{greeting}, Admin 👋</p>
            <p className="text-xs text-muted-foreground font-mono">
                {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' • '}
                <span className="text-foreground font-semibold">{time.toLocaleTimeString('id-ID')}</span>
            </p>
        </div>
    );
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
                    {trend && (
                        <span className={cn("inline-flex items-center font-medium mr-1", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
                            {trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : null}
                            {trend}%
                        </span>
                    )}
                    <span>{subtext}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function GoalProgress({ current, target, label, format = 'currency' }) {
    const pct = Math.min((current / target) * 100, 100);
    const display = format === 'currency'
        ? `Rp ${(current / 1000000).toFixed(1)}M / Rp ${(target / 1000000).toFixed(1)}M`
        : `${current.toLocaleString('id-ID')} / ${target.toLocaleString('id-ID')} sessions`;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> {label}
                </span>
                <span className="font-medium">{Math.round(pct)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", pct >= 100 ? "bg-emerald-500" : pct >= 70 ? "bg-primary" : "bg-amber-500")}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground">{display}</p>
        </div>
    );
}

export function Dashboard() {
    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value * 1000);

    // Editable Targets (persisted in localStorage)
    const [revenueTarget, setRevenueTarget] = useState(() => {
        const saved = localStorage.getItem('dashboard_revenue_target');
        return saved ? Number(saved) : 15000000;
    });
    const [sessionTarget, setSessionTarget] = useState(() => {
        const saved = localStorage.getItem('dashboard_session_target');
        return saved ? Number(saved) : 500;
    });
    const [editingTargets, setEditingTargets] = useState(false);
    const [tempRevenue, setTempRevenue] = useState(revenueTarget);
    const [tempSession, setTempSession] = useState(sessionTarget);

    const handleSaveTargets = () => {
        setRevenueTarget(tempRevenue);
        setSessionTarget(tempSession);
        localStorage.setItem('dashboard_revenue_target', tempRevenue);
        localStorage.setItem('dashboard_session_target', tempSession);
        setEditingTargets(false);
    };

    const handleCancelEdit = () => {
        setTempRevenue(revenueTarget);
        setTempSession(sessionTarget);
        setEditingTargets(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground mt-1">Real-time studio performance and operational metrics.</p>
                </div>
                <div className="flex items-center gap-4">
                    <LiveClock />
                    <Badge variant="outline" className="h-8 px-3 border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-medium shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        Live
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard title="Today's Revenue" value="Rp 12.45M" subtext="from yesterday" icon={CircleDollarSign} trend={12.5} />
                <StatCard title="Total Sessions" value="415" subtext="from yesterday" icon={Camera} trend={8.2} />
                <StatCard title="Total Customers" value="1,245" subtext="avg 3/session" icon={Users} />
                <StatCard title="Print Requests" value="340" subtext="12 pending" icon={Printer} />
                <StatCard title="Active Booths" value="3/4" subtext="Booth 2 offline" icon={MonitorPlay} />
                <StatCard title="Waiting Queue" value="24" subtext="~45m est wait" icon={Clock} />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                        <CardDescription>Hourly revenue breakdown for today</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}k`} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="col-span-3 space-y-4">
                    {/* Revenue by Theme Pie */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Revenue by Theme</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="h-[120px] w-[120px] shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={themeBreakdownData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" stroke="none">
                                                {themeBreakdownData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                                                formatter={(value) => [`${value}%`, 'Share']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    {themeBreakdownData.map((theme, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.color }} />
                                                <span className="text-muted-foreground">{theme.name}</span>
                                            </div>
                                            <span className="font-semibold">{theme.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Goal */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Today's Target
                                </CardTitle>
                                {!editingTargets ? (
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setTempRevenue(revenueTarget); setTempSession(sessionTarget); setEditingTargets(true); }}>
                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                ) : (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleSaveTargets}>
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCancelEdit}>
                                            <X className="h-4 w-4 text-rose-500" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {editingTargets ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Revenue Target (Rp)</label>
                                        <input
                                            type="number"
                                            value={tempRevenue}
                                            onChange={(e) => setTempRevenue(Number(e.target.value))}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                            step={500000}
                                            min={0}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Current: Rp {tempRevenue.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Session Target</label>
                                        <input
                                            type="number"
                                            value={tempSession}
                                            onChange={(e) => setTempSession(Number(e.target.value))}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                            step={10}
                                            min={0}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Current: {tempSession} sessions</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <GoalProgress current={12450000} target={revenueTarget} label="Revenue Goal" />
                                    <GoalProgress current={415} target={sessionTarget} label="Session Goal" format="number" />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Smart Alerts */}
                    <Card className="flex-1">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Smart Alerts
                                <Badge variant="destructive" className="ml-auto text-[10px] h-5">2</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-3 text-sm p-3 rounded-md border border-red-500/20 bg-red-500/5">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-red-600 dark:text-red-400">Booth 2 Camera Disconnected</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">Connection lost 15 minutes ago.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm p-3 rounded-md border border-amber-500/20 bg-amber-500/5">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-amber-600 dark:text-amber-400">Printer Ink Low — Booth 1</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">Estimated 20 prints remaining.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions + System Health */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs" onClick={() => alert('New Transaction')}>
                            <CircleDollarSign className="h-5 w-5 text-primary" />
                            New Txn
                        </Button>
                        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs" onClick={() => alert('Add to Queue')}>
                            <UserPlus className="h-5 w-5 text-emerald-500" />
                            Add Queue
                        </Button>
                        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs" onClick={() => alert('Print QR')}>
                            <QrCode className="h-5 w-5 text-violet-500" />
                            Print QR
                        </Button>
                        <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs" onClick={() => alert('End Shift')}>
                            <Clock className="h-5 w-5 text-amber-500" />
                            End Shift
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                System Health
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-emerald-500" /> Network</div>
                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10 text-[10px]">Online</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><Server className="h-4 w-4 text-emerald-500" /> Drive Sync</div>
                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10 text-[10px]">Synced</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><Printer className="h-4 w-4 text-amber-500" /> Print Queue</div>
                            <Badge variant="outline" className="border-amber-500/20 text-amber-500 bg-amber-500/10 text-[10px]">12 Pending</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Staff Activity */}
                <Card className="col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Staff On Duty</CardTitle>
                        <CardDescription>3 staff members currently active</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { name: 'Diana Staff', role: 'Studio Guard', task: 'Assisting Booth 1', time: 'Just now', color: 'bg-emerald-500' },
                                { name: 'Budi Cashier', role: 'Cashier', task: 'Processing #INV-109', time: '2m ago', color: 'bg-blue-500' },
                                { name: 'Ayu Staff', role: 'Studio Guard', task: 'Uploading Session #S-504', time: '5m ago', color: 'bg-violet-500' }
                            ].map((staff, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card", staff.color)} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{staff.name}</p>
                                            <p className="text-xs text-muted-foreground">{staff.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-foreground text-xs">{staff.task}</p>
                                        <p className="text-[10px] text-muted-foreground">{staff.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Log */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity Log</CardTitle>
                    <CardDescription>Latest system events and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { icon: CircleDollarSign, title: 'New Payment', desc: 'Rp 35,000 via QRIS (INV-001)', time: '10:45 AM', color: 'text-emerald-500 bg-emerald-500/10' },
                            { icon: Printer, title: 'Print Completed', desc: 'Queue A021 — 4x6 Standard', time: '10:42 AM', color: 'text-blue-500 bg-blue-500/10' },
                            { icon: Camera, title: 'Session Started', desc: 'Booth 1 — Elevator Theme — 3 pax', time: '10:40 AM', color: 'text-violet-500 bg-violet-500/10' },
                            { icon: UserPlus, title: 'Customer Queued', desc: 'Queue A022 — Siti Rahma (4 pax)', time: '10:38 AM', color: 'text-amber-500 bg-amber-500/10' },
                            { icon: CheckCircle2, title: 'Session Completed', desc: 'Booth 3 — Supermarket Theme — 5 pax', time: '10:35 AM', color: 'text-emerald-500 bg-emerald-500/10' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", log.color)}>
                                    <log.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{log.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{log.desc}</p>
                                </div>
                                <time className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</time>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

