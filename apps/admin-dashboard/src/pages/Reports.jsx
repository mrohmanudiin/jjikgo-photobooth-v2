import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, CalendarDays, Receipt, Clock, Users, ArrowRight } from 'lucide-react';

const mockReports = [
    {
        title: 'Daily Revenue & Transactions',
        desc: 'Detailed breakdown of all payments and sales for a selected date range.',
        icon: Receipt,
        formats: ['CSV', 'Excel', 'PDF']
    },
    {
        title: 'Shift Closing Logs',
        desc: 'Cash reconciliation and discrepancy reports by cashier shift.',
        icon: Clock,
        formats: ['CSV', 'PDF']
    },
    {
        title: 'Photo Sessions & Usage',
        desc: 'Booth utilization metrics, theme popularity, and session lengths.',
        icon: Users,
        formats: ['CSV', 'Excel']
    },
    {
        title: 'Complete System Backup',
        desc: 'Raw data export of all system configurations and logs.',
        icon: FileText,
        formats: ['JSON', 'CSV']
    },
];

export function Reports() {
    const handleExport = (title, format) => alert(`Starting export: ${title} in ${format} format...`);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports & Export</h2>
                    <p className="text-muted-foreground mt-1">Generate required documentation and export raw data for external analytics.</p>
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
                                <select className="h-8 text-sm rounded-md border border-input bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1">
                                    <option>Today</option>
                                    <option>Yesterday</option>
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>This Month</option>
                                    <option>Custom Date Range...</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {report.formats.map((format) => (
                                    <Button
                                        key={format}
                                        onClick={() => handleExport(report.title, format)}
                                        variant="outline"
                                        size="sm"
                                        className="w-full flex items-center justify-center gap-2 group"
                                    >
                                        <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" /> {format}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
                    <div>
                        <h3 className="font-semibold text-lg">Need a Custom Report?</h3>
                        <p className="text-sm text-muted-foreground mt-1">Contact the development team to setup automated daily/weekly report emails, or request new formatting templates.</p>
                    </div>
                    <Button variant="secondary" className="shrink-0">
                        Request Custom Report <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
