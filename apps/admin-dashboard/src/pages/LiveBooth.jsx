import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Clock, Users, Palette, MonitorPlay, AlertTriangle, ChevronRight, Image as ImageIcon, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

const mockBooths = [
    {
        id: 1,
        name: "Booth 1",
        theme: "Elevator",
        status: "In Session",
        queueNumber: "A023",
        people: 3,
        timeRemaining: "1:20",
        sessionStarted: "14:30",
    },
    {
        id: 2,
        name: "Booth 2",
        theme: "Vintage",
        status: "Idle",
        queueNumber: null,
        people: null,
        timeRemaining: null,
    },
    {
        id: 3,
        name: "Booth 3",
        theme: "Supermarket",
        status: "Waiting",
        queueNumber: "A024",
        people: 2,
        timeRemaining: "Ready",
    },
    {
        id: 4,
        name: "Booth 4 - Self Studio",
        theme: "Self Studio",
        status: "Selecting Photos",
        queueNumber: "S012",
        people: 4,
        timeRemaining: "0:45",
    },
    {
        id: 5,
        name: "Booth 5",
        theme: "Y2K Subway",
        status: "Maintenance",
        queueNumber: null,
        people: null,
        timeRemaining: null,
    }
];

function getStatusColor(status) {
    switch (status) {
        case 'Idle': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
        case 'Waiting': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
        case 'In Session': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
        case 'Selecting Photos': return 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400';
        case 'Maintenance': return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400';
        default: return 'bg-secondary text-secondary-foreground';
    }
}

export function LiveBooth() {
    const [selectedBooth, setSelectedBooth] = useState(null);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Live Booth Monitor</h2>
                    <p className="text-muted-foreground mt-1">
                        Realtime status of all photobooth machines.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockBooths.map(booth => (
                    <Card
                        key={booth.id}
                        className={cn(
                            "cursor-pointer hover:border-primary/50 transition-all hover:shadow-md",
                            selectedBooth?.id === booth.id && "ring-2 ring-primary border-transparent",
                            booth.status === 'Maintenance' && "opacity-75"
                        )}
                        onClick={() => setSelectedBooth(booth)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold">{booth.name}</CardTitle>
                            <MonitorPlay className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(booth.status))}>
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full mr-1.5",
                                        booth.status === 'In Session' ? "bg-blue-500 animate-pulse" :
                                            booth.status === 'Idle' ? "bg-emerald-500" :
                                                booth.status === 'Waiting' ? "bg-amber-500" :
                                                    booth.status === 'Selecting Photos' ? "bg-purple-500" : "bg-rose-500"
                                    )} />
                                    {booth.status}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Theme</span>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Palette className="h-4 w-4 text-primary" />
                                        {booth.theme}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Queue</span>
                                        <span className="font-semibold text-foreground">
                                            {booth.queueNumber || '—'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">People</span>
                                        <span className="font-semibold text-foreground flex items-center gap-1">
                                            {booth.people ? <><Users className="h-3 w-3" /> {booth.people}</> : '—'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md border text-xs">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            Timer
                                        </div>
                                        <span className={cn("font-bold font-mono tracking-wider", booth.timeRemaining && booth.status !== 'Idle' ? "text-primary" : "text-muted-foreground")}>
                                            {booth.timeRemaining || '00:00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedBooth && (
                <Card className="mt-8 border-primary/20 bg-primary/5 relative overflow-hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                        onClick={() => setSelectedBooth(null)}
                    >
                        &times;
                    </Button>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Viewing Details: {selectedBooth.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Status</p>
                                    <p className="font-semibold">{selectedBooth.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Theme</p>
                                    <p className="font-semibold">{selectedBooth.theme}</p>
                                </div>
                                {selectedBooth.queueNumber && (
                                    <>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Queue ID</p>
                                            <p className="font-semibold">{selectedBooth.queueNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Session Started</p>
                                            <p className="font-semibold">{selectedBooth.sessionStarted || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1">
                                    <ImageIcon className="mr-2 w-4 h-4" />
                                    View Captures
                                </Button>
                                <Button className="flex-1">
                                    Force Restart Session
                                </Button>
                            </div>
                        </div>

                        {/* Mock Camera Feed Area */}
                        <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-lg border border-border flex items-center justify-center min-h-[200px] text-muted-foreground group">
                            <div className="text-center group-hover:scale-105 transition-transform">
                                <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">Live Feed Hidden</p>
                                <p className="text-xs opacity-75">Click to view stream</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
