import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, CalendarDays, Receipt, Clock, Users, ArrowRight, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useBranch } from '../contexts/BranchContext';
import { format, subDays, startOfMonth } from 'date-fns';

const mockReports = [
    {
        title: 'Daily Revenue & Transactions',
        desc: 'Detailed breakdown of all payments and sales for a selected date range.',
        icon: Receipt,
        formats: ['CSV']
    },
    {
        title: 'Shift Closing Logs',
        desc: 'Cash reconciliation and discrepancy reports by cashier shift.',
        icon: Clock,
        formats: ['CSV']
    }
];

export function Reports() {
    const { selectedBranch } = useBranch();
    const [dateRange, setDateRange] = useState('Today');
    const [loadingReport, setLoadingReport] = useState(null);

    const getDates = (range) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (range === 'Today') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (range === 'Yesterday') {
            start = subDays(today, 1);
            start.setHours(0, 0, 0, 0);
            end = subDays(today, 1);
            end.setHours(23, 59, 59, 999);
        } else if (range === 'Last 7 Days') {
            start = subDays(today, 7);
            start.setHours(0, 0, 0, 0);
        } else if (range === 'Last 30 Days') {
            start = subDays(today, 30);
            start.setHours(0, 0, 0, 0);
        } else if (range === 'This Month') {
            start = startOfMonth(today);
            start.setHours(0, 0, 0, 0);
        }

        return { start: start.toISOString(), end: end.toISOString() };
    };

    const downloadCSV = (csvContent, fileName) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async (title, formatType) => {
        if (!selectedBranch) return alert("Select a branch first.");
        
        setLoadingReport(title);
        
        try {
            const { start, end } = getDates(dateRange);
            const branchQuery = `branch_id=${selectedBranch.id}`;

            if (title === 'Daily Revenue & Transactions') {
                // Fetch transactions
                const res = await api.get(`/transactions?${branchQuery}&date_from=${start}&date_to=${end}`);
                const txs = res.data;

                let csv = "Invoice,Date,Cashier,Theme,Package,Payment Method,Status,Subtotal,Discount,Total\n";
                txs.forEach(t => {
                    const dt = format(new Date(t.created_at), 'yyyy-MM-dd HH:mm');
                    const c = `"${t.user?.full_name || 'N/A'}"`;
                    const theme = `"${t.theme || 'N/A'}"`;
                    const pkg = `"${t.package || 'N/A'}"`;
                    csv += `${t.invoice_number},${dt},${c},${theme},${pkg},${t.payment_method},${t.status},${t.total - (t.discount_amount||0)},${t.discount_amount||0},${t.total}\n`;
                });
                
                downloadCSV(csv, `Revenue_Report_${selectedBranch.name}_${dateRange.replace(/ /g, '_')}.csv`);
            } 
            else if (title === 'Shift Closing Logs') {
                const res = await api.get(`/shifts/history?${branchQuery}&date_from=${start}&date_to=${end}`);
                const shifts = res.data;

                let csv = "ID,Start Date,End Date,Cashier,Starting Cash,Ending Cash,Expenses\n";
                shifts.forEach(s => {
                    const st = format(new Date(s.start_time), 'yyyy-MM-dd HH:mm');
                    const en = s.end_time ? format(new Date(s.end_time), 'yyyy-MM-dd HH:mm') : 'Ongoing';
                    const c = `"${s.user?.full_name || 'N/A'}"`;
                    csv += `${s.id},${st},${en},${c},${s.starting_cash},${s.ending_cash},${s.total_expenses}\n`;
                });

                downloadCSV(csv, `Shifts_Report_${selectedBranch.name}_${dateRange.replace(/ /g, '_')}.csv`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to export report.");
        } finally {
            setLoadingReport(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports & Export</h2>
                    <p className="text-muted-foreground mt-1">Generate required documentation and export real data from your branches.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {mockReports.map((report, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <report.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl">{report.title}</CardTitle>
                                <CardDescription className="text-sm leading-relaxed">{report.desc}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 mt-auto flex flex-col gap-4">
                            <div className="flex items-center gap-2 pt-2 border-t">
                                <span className="text-sm text-muted-foreground font-medium flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-2" /> Select Range:
                                </span>
                                <select 
                                    className="h-8 text-sm rounded-md border border-input bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1"
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                >
                                    <option>Today</option>
                                    <option>Yesterday</option>
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>This Month</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {report.formats.map((format) => (
                                    <Button
                                        key={format}
                                        onClick={() => handleExport(report.title, format)}
                                        variant="outline"
                                        size="sm"
                                        disabled={loadingReport === report.title}
                                        className="w-full flex items-center justify-center gap-2 group"
                                    >
                                        {loadingReport === report.title ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                        {format} Export
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
