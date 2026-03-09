import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/Button';

export function TopBar({ onToggleSidebar }) {
    const { theme, setTheme } = useTheme();

    return (
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden text-muted-foreground">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden md:flex items-center w-full max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search everywhere... (Press 'F' to focus)"
                        className="h-10 w-full rounded-md border border-input bg-muted/40 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20"
                        id="global-search"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="text-muted-foreground hover:text-foreground"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                <div className="h-8 w-8 rounded-full bg-primary/20 flex shrink-0 items-center justify-center text-primary font-bold ml-2">
                    A
                </div>
            </div>
        </header>
    );
}
