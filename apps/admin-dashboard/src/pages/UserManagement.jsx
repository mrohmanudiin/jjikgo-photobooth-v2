import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { UserPlus, Search, MoreVertical, Shield, Camera, Banknote } from 'lucide-react';

const mockUsers = [
    { id: 1, name: 'Dian Sastro', email: 'dian@jjikgo.com', role: 'Admin', status: 'Active', lastActive: '2 mins ago', phone: '+62 812-3456-7890' },
    { id: 2, name: 'Budi Santoso', email: 'budi@jjikgo.com', role: 'Cashier', status: 'Active', lastActive: '1 hr ago', phone: '+62 811-2233-4455' },
    { id: 3, name: 'Ayu Lestari', email: 'ayu@jjikgo.com', role: 'Studio Guard', status: 'Active', lastActive: '5 mins ago', phone: '+62 813-9988-7766' },
    { id: 4, name: 'Joko Anwar', email: 'joko@jjikgo.com', role: 'Studio Guard', status: 'Disabled', lastActive: '2 days ago', phone: '+62 815-5544-3322' },
];

function getRoleIcon(role) {
    switch (role) {
        case 'Admin': return <Shield className="h-3 w-3 mr-1" />;
        case 'Cashier': return <Banknote className="h-3 w-3 mr-1" />;
        case 'Studio Guard': return <Camera className="h-3 w-3 mr-1" />;
        default: return null;
    }
}

export function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = mockUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff & Roles</h2>
                    <p className="text-muted-foreground mt-1">Manage system access, roles, and view staff activity.</p>
                </div>
                <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Staff</Button>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div>
                        <CardTitle>System Users</CardTitle>
                        <CardDescription>All internal staff accounts and their permissions</CardDescription>
                    </div>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold">User</TableHead>
                                <TableHead className="font-semibold">Contact Info</TableHead>
                                <TableHead className="font-semibold">Role</TableHead>
                                <TableHead className="font-semibold">Last Active</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(u => (
                                <TableRow key={u.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {u.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <div className="font-medium">{u.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{u.email}</span>
                                            <span className="text-xs text-muted-foreground">{u.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-medium bg-background text-foreground flex w-fit items-center">
                                            {getRoleIcon(u.role)}
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.status === 'Active' ? 'success' : 'secondary'} className="font-normal">
                                            {u.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
