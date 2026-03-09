import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Eye, Printer, LayoutGrid, List, Search, Filter, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/Table';

const mockPrintRequests = [
    { id: 'PR-901', queue: 'A023', theme: 'Elevator', status: 'Pending', requested_at: '14:25', thumbnail: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80', copies: 2 },
    { id: 'PR-902', queue: 'A022', theme: 'Vintage', status: 'Printing', requested_at: '14:20', thumbnail: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80', copies: 1 },
    { id: 'PR-903', queue: 'A021', theme: 'Supermarket', status: 'Failed', requested_at: '14:15', thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&q=80', copies: 3 },
    { id: 'PR-904', queue: 'A020', theme: 'Self Studio', status: 'Completed', requested_at: '14:05', thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80', copies: 1 },
];

function getStatusBadge(status) {
    switch (status) {
        case 'Pending': return <Badge variant="outline" className="border-amber-500/20 text-amber-600 bg-amber-500/10">Pending</Badge>;
        case 'Printing': return <Badge variant="outline" className="border-blue-500/20 text-blue-600 bg-blue-500/10">Printing</Badge>;
        case 'Completed': return <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/10">Completed</Badge>;
        case 'Failed': return <Badge variant="outline" className="border-rose-500/20 text-rose-600 bg-rose-500/10">Failed</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export function PrintRequests() {
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const handlePreview = (id) => alert(`Previewing layout for ${id}`);
    const handlePrint = (id) => alert(`Sending ${id} to Printer...`);
    const handleMarkPrinted = (id) => alert(`Marking ${id} as Printed.`);

    const filteredRequests = mockPrintRequests.filter(req =>
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.queue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Print Requests</h2>
                    <p className="text-muted-foreground mt-1">Manage requested prints, resolve errors, and view print history.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
                    <div className="flex flex-1 gap-2 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search PR ID or layout..."
                                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md p-1 bg-muted/50">
                            <Button
                                variant={viewMode === 'grid' ? "secondary" : "ghost"}
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? "secondary" : "ghost"}
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className={cn(viewMode === 'grid' ? "pt-6" : "p-0")}>
                    {viewMode === 'grid' ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredRequests.map((req) => (
                                <Card key={req.id} className="overflow-hidden group hover:border-primary/30 transition-all flex flex-col">
                                    <div className="relative bg-muted aspect-[3/4]">
                                        <img
                                            src={req.thumbnail}
                                            alt={req.id}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                            <Button size="icon" variant="secondary" className="rounded-full h-10 w-10" onClick={() => handlePreview(req.id)}>
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            {getStatusBadge(req.status)}
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <h3 className="font-semibold text-base">{req.id}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">Queue: {req.queue} • {req.requested_at}</p>
                                            </div>
                                            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs h-auto shrink-0 font-medium">x{req.copies}</Badge>
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs h-8 px-2"
                                                onClick={() => handlePrint(req.id)}
                                            >
                                                <Printer className="mr-1.5 h-3.5 w-3.5" />
                                                {req.status === 'Completed' ? 'Reprint' : 'Print'}
                                            </Button>
                                            <Button
                                                variant={req.status === 'Completed' ? "secondary" : "default"}
                                                size="sm"
                                                className="w-full text-xs h-8 px-2"
                                                onClick={() => handleMarkPrinted(req.id)}
                                                disabled={req.status === 'Completed'}
                                            >
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Done
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[120px] font-semibold">Preview</TableHead>
                                    <TableHead className="font-semibold">Req ID</TableHead>
                                    <TableHead className="font-semibold">Queue</TableHead>
                                    <TableHead className="font-semibold">Theme</TableHead>
                                    <TableHead className="font-semibold">Copies</TableHead>
                                    <TableHead className="font-semibold">Time</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((req) => (
                                    <TableRow key={req.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell>
                                            <div className="w-12 h-16 rounded border overflow-hidden bg-muted">
                                                <img src={req.thumbnail} alt={req.id} className="w-full h-full object-cover" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-primary">{req.id}</TableCell>
                                        <TableCell>{req.queue}</TableCell>
                                        <TableCell>{req.theme}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs font-medium">x{req.copies}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{req.requested_at}</TableCell>
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handlePreview(req.id)} title="Preview">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handlePrint(req.id)} title="Send to Printer">
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600" onClick={() => handleMarkPrinted(req.id)} disabled={req.status === 'Completed'} title="Mark as Printed">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
