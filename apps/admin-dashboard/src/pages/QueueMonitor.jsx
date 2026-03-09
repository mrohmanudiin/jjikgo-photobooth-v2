import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/Table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, Filter, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

const mockQueue = [
    { id: 1, number: 'A023', name: 'Alif R.', theme: 'Elevator', booth: 'Booth 1', people: 3, status: 'In Session', time: '14:20' },
    { id: 2, number: 'A024', name: 'Budi Santoso', theme: 'Vintage', booth: 'Booth 2', people: 2, status: 'Waiting', time: '14:25' },
    { id: 3, number: 'A025', name: 'Siti Rahma', theme: 'Elevator', booth: 'Booth 1', people: 4, status: 'Selecting Photos', time: '14:15' },
    { id: 4, number: 'A026', name: 'Dian & Friends', theme: 'Supermarket', booth: 'Booth 3', people: 5, status: 'Ready To Print', time: '14:10' },
    { id: 5, number: 'A027', name: 'Fikri', theme: 'Self Studio', booth: 'Booth 4 - Self Studio', people: 1, status: 'Called', time: '14:30' },
    { id: 6, number: 'A028', name: 'Anita', theme: 'Elevator', booth: 'Booth 1', people: 2, status: 'Completed', time: '14:05' },
];

function getStatusBadge(status) {
    switch (status) {
        case 'Waiting': return <Badge variant="outline" className="border-amber-500/20 text-amber-600 bg-amber-500/10">Waiting</Badge>;
        case 'Called': return <Badge variant="outline" className="border-cyan-500/20 text-cyan-600 bg-cyan-500/10">Called</Badge>;
        case 'In Session': return <Badge variant="outline" className="border-blue-500/20 text-blue-600 bg-blue-500/10">In Session</Badge>;
        case 'Selecting Photos': return <Badge variant="outline" className="border-purple-500/20 text-purple-600 bg-purple-500/10">Selecting Photos</Badge>;
        case 'Ready To Print': return <Badge variant="outline" className="border-pink-500/20 text-pink-600 bg-pink-500/10">Ready To Print</Badge>;
        case 'Completed': return <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/10">Completed</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export function QueueMonitor() {
    const [searchTerm, setSearchTerm] = useState('');
    const [themeFilter, setThemeFilter] = useState('All Themes');
    const [boothFilter, setBoothFilter] = useState('All Booths');
    const [statusFilter, setStatusFilter] = useState('All Statuses');

    const filteredQueue = mockQueue.filter(q =>
        (themeFilter === 'All Themes' || q.theme === themeFilter) &&
        (boothFilter === 'All Booths' || q.booth === boothFilter) &&
        (statusFilter === 'All Statuses' || q.status === statusFilter) &&
        (q.name.toLowerCase().includes(searchTerm.toLowerCase()) || q.number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Queue Monitor</h2>
                    <p className="text-muted-foreground mt-1">
                        Live tracking of customer queue and session flow.
                    </p>
                </div>
                <div className="flex bg-muted p-1 rounded-md">
                    <Button variant="ghost" className="h-8 px-4 bg-background shadow-sm text-sm">Active</Button>
                    <Button variant="ghost" className="h-8 px-4 text-muted-foreground text-sm">Completed</Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                    <div className="flex flex-1 gap-2 max-w-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search queue number or name..."
                                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="hidden md:flex flex-wrap items-center gap-2">
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All Statuses">All Statuses</option>
                            <option value="Waiting">Waiting</option>
                            <option value="Called">Called</option>
                            <option value="In Session">In Session</option>
                            <option value="Selecting Photos">Selecting Photos</option>
                            <option value="Ready To Print">Ready To Print</option>
                        </select>
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={themeFilter}
                            onChange={(e) => setThemeFilter(e.target.value)}
                        >
                            <option value="All Themes">All Themes</option>
                            <option value="Elevator">Elevator</option>
                            <option value="Vintage">Vintage</option>
                            <option value="Supermarket">Supermarket</option>
                            <option value="Self Studio">Self Studio</option>
                        </select>
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={boothFilter}
                            onChange={(e) => setBoothFilter(e.target.value)}
                        >
                            <option value="All Booths">All Booths</option>
                            <option value="Booth 1">Booth 1</option>
                            <option value="Booth 2">Booth 2</option>
                            <option value="Booth 3">Booth 3</option>
                            <option value="Booth 4 - Self Studio">Booth 4</option>
                        </select>
                    </div>
                </CardHeader>
                <div className="border-t">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px] font-semibold">Queue No</TableHead>
                                <TableHead className="font-semibold">Customer Name</TableHead>
                                <TableHead className="font-semibold">Details</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold text-muted-foreground w-[100px]">Created</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQueue.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors group">
                                    <TableCell className="font-medium text-primary">
                                        {item.number}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">{item.theme}</span>
                                            <span>•</span>
                                            <span>{item.booth}</span>
                                            <span>•</span>
                                            <span>{item.people} pax</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(item.status)}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {item.time}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredQueue.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Filter className="h-8 w-8 text-muted-foreground/50" />
                                            <p>No customers found matching the criteria.</p>
                                            <Button variant="link" onClick={() => { setSearchTerm(''); setThemeFilter('All Themes'); setBoothFilter('All Booths'); setStatusFilter('All Statuses'); }}>Clear Filters</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
