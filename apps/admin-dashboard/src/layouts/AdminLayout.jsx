import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { cn } from '../lib/utils';

export function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case 'f':
                    e.preventDefault();
                    document.getElementById('global-search')?.focus();
                    break;
                case 'q':
                    e.preventDefault();
                    navigate('/queue');
                    break;
                case 'n':
                    e.preventDefault();
                    alert('Shortcut: Trigger new transaction (mock functionality)');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Mobile Sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 lg:static lg:block transition-transform duration-300 ease-in-out",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
                <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <div className="flex-1 p-4 lg:p-8 w-full max-w-[1400px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
