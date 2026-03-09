import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Eye, Download, Printer, Search, Filter, CalendarDays, MonitorPlay, Users, LayoutGrid, List } from 'lucide-react';
import { cn } from '../lib/utils';

const mockSessions = [
    { id: 'SESS-1001', queue: 'A023', theme: 'Elevator', booth: 'Booth 1', people: 3, photosAmount: 6, status: 'Uploaded', created_at: '2026-03-08 14:10', thumbnail: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&q=80' },
    { id: 'SESS-1002', queue: 'A024', theme: 'Vintage', booth: 'Booth 2', people: 2, photosAmount: 4, status: 'Printing', created_at: '2026-03-08 14:15', thumbnail: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&q=80' },
    { id: 'SESS-1003', queue: 'A025', theme: 'Supermarket', booth: 'Booth 3', people: 4, photosAmount: 8, status: 'Uploaded', created_at: '2026-03-08 14:20', thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&q=80' },
    { id: 'SESS-1004', queue: 'A026', theme: 'Self Studio', booth: 'Booth 4', people: 2, photosAmount: 12, status: 'Failed Sync', created_at: '2026-03-08 14:30', thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80' },
    { id: 'SESS-1005', queue: 'A027', theme: 'Elevator', booth: 'Booth 1', people: 5, photosAmount: 10, status: 'Uploaded', created_at: '2026-03-08 15:05', thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&q=80' },
    { id: 'SESS-1006', queue: 'A028', theme: 'Y2K Subway', booth: 'Booth 5', people: 3, photosAmount: 6, status: 'Uploading', created_at: '2026-03-08 15:20', thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&q=80' },
];

export function PhotoSessions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const handlePrint = (id) => {
        alert(`Print job requested for session ${id}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Photo Sessions</h2>
                    <p className="text-muted-foreground mt-1">Review captures, download original files, and manage print requests.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
                    <div className="flex flex-1 gap-2 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search session ID or queue..."
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
                        <Button variant="outline" className="text-sm font-normal">
                            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                            Today
                        </Button>
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
                <CardContent className="pt-6">
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                    )}>
                        {mockSessions.filter(s => s.id.toLowerCase().includes(searchTerm.toLowerCase()) || s.queue.toLowerCase().includes(searchTerm.toLowerCase())).map((session) => (
                            <Card key={session.id} className={cn(
                                "overflow-hidden group hover:border-primary/30 transition-all",
                                viewMode === 'list' && "flex flex-row"
                            )}>
                                <div className={cn(
                                    "relative bg-muted",
                                    viewMode === 'grid' ? "aspect-[4/3]" : "w-48 shrink-0"
                                )}>
                                    <img
                                        src={session.thumbnail}
                                        alt={session.id}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                                            <Eye className="h-5 w-5" />
                                        </Button>
                                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                                            <Download className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <Badge className={cn("absolute top-2 right-2",
                                        session.status === 'Uploaded' ? "bg-emerald-500/90 hover:bg-emerald-500" :
                                            session.status === 'Printing' ? "bg-blue-500/90 hover:bg-blue-500" :
                                                session.status === 'Uploading' ? "bg-amber-500/90 hover:bg-amber-500" :
                                                    "bg-rose-500/90 hover:bg-rose-500"
                                    )}>
                                        {session.status}
                                    </Badge>
                                </div>

                                <div className={cn(
                                    "flex flex-col flex-1",
                                    viewMode === 'grid' ? "p-4 space-y-3" : "py-3 px-6 justify-between"
                                )}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                {session.id}
                                                <span className="text-xs font-normal text-muted-foreground">({session.queue})</span>
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{session.created_at}</p>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "grid gap-2 text-sm",
                                        viewMode === 'grid' ? "grid-cols-2" : "flex gap-6 items-center"
                                    )}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Theme</span>
                                            <span className="font-medium flex items-center gap-1.5"><MonitorPlay className="w-3.5 h-3.5" />{session.theme}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Details</span>
                                            <span className="font-medium flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{session.people} pax • {session.photosAmount} imgs</span>
                                        </div>
                                    </div>

                                    <div className={cn("flex gap-2", viewMode === 'grid' ? "pt-2 border-t mt-2" : "mt-auto items-center justify-end")}>
                                        <Button variant="outline" size={viewMode === 'list' ? "sm" : "default"} className="flex-1" onClick={() => handlePrint(session.id)}>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Send to Print
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
