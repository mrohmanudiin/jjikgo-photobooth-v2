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
import { Search, CalendarDays, Download, CircleDollarSign, Receipt, TrendingUp, ArrowUpRight } from 'lucide-react';

const mockTransactions = [
    { id: 'INV-20260308-001', name: 'Alif R.', theme: 'Elevator', price: 35000, payment: 'QRIS', status: 'Success', date: '2026-03-08 14:20', people: 2 },
    { id: 'INV-20260308-002', name: 'Budi Santoso', theme: 'Vintage', price: 35000, payment: 'Cash', status: 'Success', date: '2026-03-08 14:25', people: 2 },
    { id: 'INV-20260308-003', name: 'Siti Rahma', theme: 'Elevator', price: 50000, payment: 'EDC (Card)', status: 'Success', date: '2026-03-08 14:15', people: 4 },
    { id: 'INV-20260308-004', name: 'Dian & Friends', theme: 'Supermarket', price: 100000, payment: 'QRIS', status: 'Success', date: '2026-03-08 14:10', people: 5 },
    { id: 'INV-20260308-005', name: 'Fikri', theme: 'Self Studio', price: 150000, payment: 'QRIS', status: 'Success', date: '2026-03-08 14:30', people: 2 },
    { id: 'INV-20260308-006', name: 'Rina Kartika', theme: 'Y2K Subway', price: 40000, payment: 'Cash', status: 'Refunded', date: '2026-03-08 13:55', people: 3 },
];

function getPaymentBadge(method) {
    const styles = {
        'QRIS': 'border-blue-500/20 text-blue-600 bg-blue-500/10',
        'Cash': 'border-emerald-500/20 text-emerald-600 bg-emerald-500/10',
        'EDC (Card)': 'border-violet-500/20 text-violet-600 bg-violet-500/10',
    };
    return <Badge variant="outline" className={styles[method] || ''}>{method}</Badge>;
}

export function TransactionHistory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [dateRange, setDateRange] = useState('Today');

    const filteredData = mockTransactions.filter(t =>
        (paymentFilter === 'All' || t.payment === paymentFilter) &&
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalRevenue = filteredData.reduce((acc, t) => t.status === 'Success' ? acc + t.price : acc, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
                    <p className="text-muted-foreground mt-1">Full ledger of all customer payments and invoices.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md p-1 bg-muted/50">
                        {['Today', '7 Days', '30 Days'].map(range => (
                            <Button key={range} variant={dateRange === range ? "secondary" : "ghost"} size="sm" className="h-8 text-xs px-3" onClick={() => setDateRange(range)}>
                                {range}
                            </Button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="h-[36px]">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Filtered Revenue</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <CircleDollarSign className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {totalRevenue.toLocaleString('id-ID')}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Receipt className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredData.length}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Ticket</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {filteredData.length ? Math.round(totalRevenue / filteredData.length).toLocaleString('id-ID') : 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <CardTitle>All Transactions</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search invoice or name..."
                                className="h-9 w-full sm:w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <option value="All">All Payments</option>
                            <option value="QRIS">QRIS</option>
                            <option value="Cash">Cash</option>
                            <option value="EDC (Card)">EDC (Card)</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold">Invoice ID</TableHead>
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Customer</TableHead>
                                <TableHead className="font-semibold">Theme</TableHead>
                                <TableHead className="font-semibold">Pax</TableHead>
                                <TableHead className="font-semibold">Payment</TableHead>
                                <TableHead className="font-semibold">Amount</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((t) => (
                                <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-primary">{t.id}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{t.date}</TableCell>
                                    <TableCell className="font-medium">{t.name}</TableCell>
                                    <TableCell>{t.theme}</TableCell>
                                    <TableCell>{t.people}</TableCell>
                                    <TableCell>{getPaymentBadge(t.payment)}</TableCell>
                                    <TableCell className="font-medium">Rp {t.price.toLocaleString('id-ID')}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.status === 'Success' ? 'success' : t.status === 'Refunded' ? 'warning' : 'destructive'} className="font-normal">
                                            {t.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Receipt className="h-10 w-10 opacity-30" />
                                            <p className="font-medium">No transactions found</p>
                                            <p className="text-xs">Try adjusting your search or filter.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
