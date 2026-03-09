import React, { useState } from 'react';
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
    ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { cn } from '../lib/utils';

const paymentMethodData = [
    { name: 'QRIS', value: 8500000, color: 'hsl(var(--primary))' },
    { name: 'EDC (Card)', value: 2500000, color: '#3b82f6' },
    { name: 'Transfer', value: 1000000, color: '#8b5cf6' },
    { name: 'Cash', value: 450000, color: '#10b981' },
];

const peakHourHeatmapData = [
    { time: '10:00', load: 20 },
    { time: '11:00', load: 35 },
    { time: '12:00', load: 50 },
    { time: '13:00', load: 70 },
    { time: '14:00', load: 85 },
    { time: '15:00', load: 60 },
    { time: '16:00', load: 75 },
    { time: '17:00', load: 90 },
    { time: '18:00', load: 100 },
    { time: '19:00', load: 95 },
    { time: '20:00', load: 80 },
    { time: '21:00', load: 40 },
];

const themeRevenueData = [
    { name: 'Elevator', revenue: 5500000 },
    { name: 'Vintage', revenue: 3200000 },
    { name: 'Supermarket', revenue: 2100000 },
    { name: 'Self Studio', revenue: 1650000 },
];

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
                        <span className="inline-flex items-center font-medium mr-1 text-emerald-500">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            {trend}%
                        </span>
                    )}
                    <span>{subtext}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export function FinanceDashboard() {
    const [dateRange, setDateRange] = useState('Today');

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance Analytics</h2>
                    <p className="text-muted-foreground mt-1">Deep dive into financial metrics, revenue breakdown, and trends.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center border rounded-md p-1 bg-muted/50">
                        {['Today', '7 Days', '30 Days', 'Custom'].map(range => (
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
                    <Button variant="outline" size="sm" className="h-[36px]">
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm" className="h-[36px]">
                        <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value="Rp 12,450,000" subtext="vs previous period" icon={CircleDollarSign} trend={12.5} />
                <StatCard title="Total Transactions" value="415" subtext="vs previous period" icon={Activity} trend={8.2} />
                <StatCard title="Avg Check Size" value="Rp 30,000" subtext="Stable" icon={CreditCard} />
                <StatCard title="Net Profit (Est)" value="Rp 8,500,000" subtext="68% margin" icon={TrendingUp} trend={3.1} />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
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
                                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `Rp${v / 1000000}M`} />
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
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={themeRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v / 1000}k`} />
                                <Tooltip
                                    formatter={(v) => formatCurrency(v)}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Large Transactions</CardTitle>
                        <CardDescription>Payments above average ticket size</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { id: 'INV-1092', amount: 150000, method: 'QRIS', time: '14:30', cust: 'Dian & Friends (5 pax)' },
                                { id: 'INV-1088', amount: 120000, method: 'EDC (Card)', time: '13:15', cust: 'Siti Rahma (4 pax)' },
                                { id: 'INV-1045', amount: 180000, method: 'QRIS', time: '11:20', cust: 'Corporate Group (6 pax)' }
                            ].map((tx, i) => (
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
                        <Button variant="link" className="w-full mt-4 text-muted-foreground">View all transactions</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
