import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, TrendingUp, Users, MonitorPlay, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const mockThemes = [
    { id: 1, name: 'Elevator', maxPeople: 4, duration: 15, price: 35000, status: 'Active', sessionsTotal: 1240, revenueTotal: 43400000, trend: 15 },
    { id: 2, name: 'Vintage', maxPeople: 2, duration: 10, price: 35000, status: 'Active', sessionsTotal: 980, revenueTotal: 34300000, trend: 8 },
    { id: 3, name: 'Supermarket', maxPeople: 6, duration: 15, price: 35000, status: 'Active', sessionsTotal: 750, revenueTotal: 26250000, trend: -2 },
    { id: 4, name: 'Y2K Subway', maxPeople: 4, duration: 15, price: 40000, status: 'Active', sessionsTotal: 420, revenueTotal: 16800000, trend: 25 },
    { id: 5, name: 'Self Studio', maxPeople: 10, duration: 30, price: 150000, status: 'Maintenance', sessionsTotal: 110, revenueTotal: 16500000, trend: 0 },
    { id: 6, name: 'Laundry Room', maxPeople: 3, duration: 10, price: 35000, status: 'Inactive', sessionsTotal: 0, revenueTotal: 0, trend: 0 },
];

const themeChartData = mockThemes.map(t => ({
    name: t.name,
    sessions: t.sessionsTotal,
    revenue: t.revenueTotal / 1000000 // In millions
})).sort((a, b) => b.sessions - a.sessions).slice(0, 5);

export function ThemeManagement() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredThemes = mockThemes.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalSessions = mockThemes.reduce((acc, t) => acc + t.sessionsTotal, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Theme Management</h2>
                    <p className="text-muted-foreground mt-1">Manage photobooth themes and track their performance.</p>
                </div>
                <Button><Plus className="mr-2 h-4 w-4" /> Add New Theme</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Themes by Usage</CardTitle>
                        <CardDescription>Most popular themes based on total sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={themeChartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                />
                                <Bar dataKey="sessions" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" maxBarSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue per Theme (Millions)</CardTitle>
                        <CardDescription>Financial performance breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={themeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `Rp${v}M`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    formatter={(value) => [`Rp ${value}M`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="#10b981" maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div>
                        <CardTitle>All Themes</CardTitle>
                        <CardDescription>Detailed list of configured themes</CardDescription>
                    </div>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search themes..."
                            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold">Theme Name</TableHead>
                                <TableHead className="font-semibold">Settings</TableHead>
                                <TableHead className="font-semibold">Price</TableHead>
                                <TableHead className="font-semibold">Total Sessions</TableHead>
                                <TableHead className="font-semibold">Trend</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredThemes.map(t => (
                                <TableRow key={t.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <MonitorPlay className="h-4 w-4 text-primary opacity-70" />
                                        {t.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div><span className="font-medium text-foreground">{t.maxPeople}</span> Max Pax</div>
                                            <div><span className="font-medium text-foreground">{t.duration}</span> Mins Limit</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">Rp {t.price.toLocaleString('id-ID')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{t.sessionsTotal.toLocaleString()}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {((t.sessionsTotal / totalSessions) * 100).toFixed(1)}% of total
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn("flex items-center text-xs font-medium", t.trend > 0 ? "text-emerald-500" : t.trend < 0 ? "text-rose-500" : "text-muted-foreground")}>
                                            {t.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : t.trend < 0 ? <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> : "- "}
                                            {Math.abs(t.trend)}%
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={t.status === 'Active' ? 'success' : t.status === 'Maintenance' ? 'warning' : 'secondary'} className="font-normal">
                                            {t.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="mr-2">Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
