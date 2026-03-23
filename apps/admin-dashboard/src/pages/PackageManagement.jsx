import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../utils/api';
import { useBranch } from '../contexts/BranchContext';

export function PackageManagement() {
    const { selectedBranch } = useBranch();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ label: '', price: '', description: '', active: true });
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/studio/packages');
            setPackages(res.data || []);
        } catch (err) {
            console.error('Failed to load packages', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPackages(); }, [fetchPackages]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/studio/packages/${editingId}`, formData);
            } else {
                await api.post('/studio/packages', formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ label: '', price: '', description: '', active: true });
            fetchPackages();
        } catch (err) {
            alert('Failed to save package: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (pkg) => {
        setEditingId(pkg.id);
        setFormData({ label: pkg.label, price: pkg.price, description: pkg.description || '', active: pkg.active !== false });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this package?')) return;
        try {
            await api.delete(`/studio/packages/${id}`);
            fetchPackages();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const filtered = packages.filter(p => p.label?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Package Management</h2>
                    <p className="text-muted-foreground mt-1">Manage photobooth packages available in the cashier app.</p>
                </div>
                <Button onClick={() => { setEditingId(null); setFormData({ label: '', price: '', description: '', active: true }); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Package
                </Button>
            </div>

            {showForm && (
                <Card className="border-primary/30">
                    <CardHeader className="pb-4">
                        <CardTitle>{editingId ? 'Edit Package' : 'New Package'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Name</label>
                                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Package name" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Price (Rp)</label>
                                <input type="number" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="0" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Description</label>
                            <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional description" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleSave} disabled={saving || !formData.label || !formData.price}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {editingId ? 'Update' : 'Create'}
                            </Button>
                            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div>
                        <CardTitle>All Packages ({packages.length})</CardTitle>
                    </div>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" placeholder="Search..." className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold">Price</TableHead>
                                <TableHead className="font-semibold">Description</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(pkg => (
                                <TableRow key={pkg.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{pkg.label}</TableCell>
                                    <TableCell>Rp {Number(pkg.price).toLocaleString('id-ID')}</TableCell>
                                    <TableCell className="text-muted-foreground">{pkg.description || '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={pkg.active !== false ? 'success' : 'secondary'}>{pkg.active !== false ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No packages found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
