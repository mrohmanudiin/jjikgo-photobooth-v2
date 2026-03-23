import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Save, CheckCircle2, Cloud, Printer, Bell, Palette, Settings2, HardDrive } from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
];

function SettingRow({ label, description, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b last:border-b-0">
            <div className="space-y-0.5">
                <label className="text-sm font-medium">{label}</label>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="max-w-sm w-full sm:w-auto">{children}</div>
        </div>
    );
}

function Toggle({ defaultChecked = false }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => setChecked(!checked)} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20", checked ? "bg-primary" : "bg-input")}>
            <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm", checked ? "translate-x-6" : "translate-x-1")} />
        </button>
    );
}

export function Settings() {
    const [activeTab, setActiveTab] = useState('notifications');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground mt-1">Global photobooth, hardware, and notification configuration.</p>
                </div>
                <Button>
                    <Save className="mr-2 h-4 w-4" /> Save All Changes
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <nav className="flex md:flex-col gap-1 md:w-56 shrink-0 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left whitespace-nowrap", activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="flex-1 min-w-0">
                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Configure when and how you receive alerts.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-0">
                                <SettingRow label="Booth Error Alerts" description="Get notified when a booth encounters a hardware error.">
                                    <Toggle defaultChecked={true} />
                                </SettingRow>
                                <SettingRow label="Low Ink / Paper Warning" description="Alert when printer supplies are running low.">
                                    <Toggle defaultChecked={true} />
                                </SettingRow>
                                <SettingRow label="Queue Full Alert" description="Notify when queue exceeds a specified threshold.">
                                    <Toggle defaultChecked={false} />
                                </SettingRow>
                                <SettingRow label="Daily Revenue Summary" description="Receive an end-of-day revenue report via email.">
                                    <Toggle defaultChecked={true} />
                                </SettingRow>
                                <SettingRow label="Notification Email" description="Email address for system notifications.">
                                    <input type="email" defaultValue="admin@jjikgo.com" className="h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" />
                                </SettingRow>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'appearance' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of the admin dashboard.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-0">
                                <SettingRow label="Dark Mode" description="Use dark theme for the admin panel.">
                                    <Toggle defaultChecked={true} />
                                </SettingRow>
                                <SettingRow label="Compact Sidebar" description="Use a narrower sidebar on desktop.">
                                    <Toggle defaultChecked={false} />
                                </SettingRow>
                                <SettingRow label="Language" description="Interface language for the dashboard.">
                                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 min-w-[180px]">
                                        <option>English</option>
                                        <option>Bahasa Indonesia</option>
                                        <option>한국어 (Korean)</option>
                                    </select>
                                </SettingRow>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
