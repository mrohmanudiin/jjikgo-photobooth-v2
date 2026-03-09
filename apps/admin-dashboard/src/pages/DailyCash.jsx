import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FileText, CheckCircle2, Clock, Banknote, ArrowRight, User } from 'lucide-react';
import { cn } from '../lib/utils';

const shiftData = {
    cashier: 'Budi Santoso',
    start: '10:00',
    end: '20:00',
    openingCash: 500000,
    cash: 2500000,
    qris: 8500000,
    edc: 1200000,
    transfer: 1000000,
};

const previousShifts = [
    { id: 1, date: '2026-03-07', cashier: 'Ayu Lestari', total: 11800000, status: 'Confirmed', discrepancy: 0 },
    { id: 2, date: '2026-03-06', cashier: 'Budi Santoso', total: 9500000, status: 'Confirmed', discrepancy: -15000 },
    { id: 3, date: '2026-03-05', cashier: 'Ayu Lestari', total: 13200000, status: 'Confirmed', discrepancy: 0 },
];

export function DailyCash() {
    const [confirmed, setConfirmed] = useState(false);
    const [actualCash, setActualCash] = useState('');

    const expectedCash = shiftData.openingCash + shiftData.cash;
    const totalSales = shiftData.cash + shiftData.qris + shiftData.edc + shiftData.transfer;
    const discrepancy = actualCash ? parseInt(actualCash) - expectedCash : null;

    const handleConfirm = () => {
        setConfirmed(true);
        alert('Cash drawer confirmed. Shift report saved.');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daily Cash Closing</h2>
                    <p className="text-muted-foreground mt-1">Reconcile shift sales, verify cash drawer, and close out the day.</p>
                </div>
                <Button variant="outline" onClick={() => alert('Generating PDF shift report...')}>
                    <FileText className="mr-2 h-4 w-4" /> Generate PDF Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Current Shift Summary</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <User className="h-3.5 w-3.5" /> {shiftData.cashier}
                                <span className="text-muted-foreground">•</span>
                                <Clock className="h-3.5 w-3.5" /> {shiftData.start} — {shiftData.end}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/10 shrink-0">Live</Badge>
                    </CardHeader>
                    <CardContent className="space-y-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground uppercase font-medium">Opening Cash</p>
                                <p className="text-lg font-bold mt-1">Rp {shiftData.openingCash.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground uppercase font-medium">Total Shift Sales</p>
                                <p className="text-lg font-bold text-primary mt-1">Rp {totalSales.toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        {[
                            { label: 'Cash Sales', value: shiftData.cash, color: 'emerald' },
                            { label: 'QRIS', value: shiftData.qris, color: 'blue' },
                            { label: 'EDC (Card)', value: shiftData.edc, color: 'violet' },
                            { label: 'Bank Transfer', value: shiftData.transfer, color: 'amber' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b last:border-b-0">
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2 w-2 rounded-full", `bg-${item.color}-500`)} />
                                    <span className="text-sm text-muted-foreground">{item.label}</span>
                                </div>
                                <span className="font-medium text-sm">Rp {item.value.toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className={cn("flex flex-col", confirmed && "border-emerald-500/50")}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-primary" />
                            Cash Drawer
                        </CardTitle>
                        <CardDescription>Verify actual cash in the register.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <div className="bg-muted p-6 rounded-lg text-center space-y-1 mb-4">
                            <p className="text-xs text-muted-foreground uppercase font-medium">Expected Cash in Drawer</p>
                            <h3 className="text-3xl font-bold tracking-tight">Rp {expectedCash.toLocaleString('id-ID')}</h3>
                            <p className="text-[10px] text-muted-foreground">(Opening Rp {shiftData.openingCash.toLocaleString('id-ID')} + Cash Sales Rp {shiftData.cash.toLocaleString('id-ID')})</p>
                        </div>

                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium">Actual Cash Count</label>
                            <input
                                type="number"
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value)}
                                placeholder="Enter actual amount..."
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                disabled={confirmed}
                            />
                            {discrepancy !== null && (
                                <p className={cn("text-xs font-medium mt-1", discrepancy === 0 ? "text-emerald-500" : discrepancy > 0 ? "text-blue-500" : "text-rose-500")}>
                                    {discrepancy === 0 ? '✓ Exact match!' : discrepancy > 0 ? `+Rp ${discrepancy.toLocaleString('id-ID')} over` : `-Rp ${Math.abs(discrepancy).toLocaleString('id-ID')} short`}
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleConfirm}
                            disabled={confirmed || !actualCash}
                            className="w-full mt-auto h-11"
                            variant={confirmed ? "outline" : "default"}
                        >
                            {confirmed ? (
                                <><CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" /> Shift Confirmed</>
                            ) : (
                                "Confirm & Close Shift"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Previous Shift Closings</CardTitle>
                    <CardDescription>History of confirmed shift reconciliations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {previousShifts.map((shift) => (
                            <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{shift.date}</p>
                                        <p className="text-xs text-muted-foreground">{shift.cashier}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">Rp {shift.total.toLocaleString('id-ID')}</p>
                                    <p className={cn("text-xs font-medium", shift.discrepancy === 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {shift.discrepancy === 0 ? 'No discrepancy' : `${shift.discrepancy > 0 ? '+' : ''}Rp ${shift.discrepancy.toLocaleString('id-ID')}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
