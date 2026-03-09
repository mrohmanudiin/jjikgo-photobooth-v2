import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Camera, Printer, Server, Search, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockBooths = [
    {
        id: 1, name: 'Booth 1', themeAssigned: 'Elevator', status: 'Online',
        hardware: { camera: 'OK', printer: 'Low Ink', storage: '80%' },
        revenue: 4500000, sessions: 120
    },
    {
        id: 2, name: 'Booth 2', themeAssigned: 'Vintage', status: 'Online',
        hardware: { camera: 'OK', printer: 'OK', storage: '45%' },
        revenue: 3800000, sessions: 105
    },
    {
        id: 3, name: 'Booth 3', themeAssigned: 'Supermarket', status: 'Online',
        hardware: { camera: 'OK', printer: 'Error', storage: '60%' },
        revenue: 2100000, sessions: 65
    },
    {
        id: 4, name: 'Booth 4 - Self Studio', themeAssigned: 'Self Studio', status: 'Maintenance',
        hardware: { camera: 'Offline', printer: 'OK', storage: '90%' },
        revenue: 2050000, sessions: 45
    },
];

const boothRevenueData = mockBooths.map(b => ({
    name: b.name.split(' -')[0],
    revenue: b.revenue / 1000000
}));

function HardwareStatus({ status, type }) {
    if (type === 'storage') {
        const value = parseInt(status);
        return (
            <div className="flex items-center gap-1.5 text-xs">
                <Server className={cn("h-3 w-3", value > 80 ? "text-rose-500" : "text-muted-foreground")} />
                <span className={cn(value > 80 && "text-rose-500 font-medium")}>{status}</span>
            </div>
        )
    }

    const Icon = type === 'camera' ? Camera : Printer;
    let color = "text-emerald-500";
    let bg = "bg-emerald-500/10";

    if (status === 'Error' || status === 'Offline') {
        color = "text-rose-500";
        bg = "bg-rose-500/10";
    } else if (status === 'Low Ink') {
        color = "text-amber-500";
        bg = "bg-amber-500/10";
    }

    return (
        <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium w-fit", bg, color)}>
            <Icon className="h-3 w-3" />
            {status}
        </div>
    )
}

export function BoothManagement() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBooths = mockBooths.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Booth Management</h2>
                    <p className="text-muted-foreground mt-1">Monitor hardware health and physical booth performance.</p>
                </div>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Booth</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-1 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Booth Health Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium">Online & Healthy</span>
                                </div>
                                <span className="font-bold">2</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-medium">Warning (Low Ink/Storage)</span>
                                </div>
                                <span className="font-bold">1</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-rose-500" />
                                    <span className="text-sm font-medium">Offline/Error</span>
                                </div>
                                <span className="font-bold">1</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue by Booth (Millions)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={boothRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `Rp${v}M`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    formatter={(value) => [`Rp ${value}M`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="#3b82f6" maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div>
                        <CardTitle>All Booths</CardTitle>
                        <CardDescription>Status and hardware metrics</CardDescription>
                    </div>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search booths..."
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
                                <TableHead className="font-semibold">Booth</TableHead>
                                <TableHead className="font-semibold">Current Theme</TableHead>
                                <TableHead className="font-semibold">Hardware Sensors</TableHead>
                                <TableHead className="font-semibold">Today's Sessions</TableHead>
                                <TableHead className="font-semibold">Revenue</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBooths.map(b => (
                                <TableRow key={b.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{b.name}</TableCell>
                                    <TableCell>{b.themeAssigned}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <HardwareStatus type="camera" status={b.hardware.camera} />
                                            <HardwareStatus type="printer" status={b.hardware.printer} />
                                            <HardwareStatus type="storage" status={b.hardware.storage} />
                                        </div>
                                    </TableCell>
                                    <TableCell>{b.sessions}</TableCell>
                                    <TableCell className="font-medium">Rp {b.revenue.toLocaleString('id-ID')}</TableCell>
                                    <TableCell>
                                        <Badge variant={b.status === 'Online' ? 'success' : 'destructive'} className="font-normal">
                                            {b.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="mr-2">Configure</Button>
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
