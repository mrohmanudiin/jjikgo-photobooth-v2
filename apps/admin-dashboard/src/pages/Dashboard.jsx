import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Camera, DollarSign, Activity, ArrowUp, ArrowDown, Loader2, Target, CalendarDays, Zap } from 'lucide-react';
import api from '../utils/api';
import { useBranch } from '../contexts/BranchContext';
import { format, subDays } from 'date-fns';

function StatCard({ title, value, icon: Icon, trend, trendLabel, colorClass = 'text-primary', bgClass = 'bg-primary/10' }) {
  const positive = trend >= 0;
  return (
    <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`${bgClass} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
        <div className="text-3xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{value}</div>
        <div className="text-sm text-muted-foreground font-medium">{title}</div>
        {trendLabel && <div className="text-xs text-muted-foreground mt-1">{trendLabel}</div>}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { selectedBranch } = useBranch();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyTarget, setDailyTarget] = useState(1000000);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const today = format(new Date(), 'yyyy-MM-dd');
      const from30 = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      if (selectedBranch) params.append('branch_id', selectedBranch.id);
      params.append('date_from', from30);
      params.append('date_to', today);

      const [{ data: txAll }, { data: settingsData }] = await Promise.all([
        api.get(`/transactions?${params}`),
        api.get(`/studio/settings?branchFilter=${selectedBranch?.id || ''}`)
      ]);

      if (settingsData && settingsData.daily_target_revenue) {
        setDailyTarget(Number(settingsData.daily_target_revenue));
      }

      // Compute stats
      const txList = Array.isArray(txAll) ? txAll : [];
      const todayTx = txList.filter(t => format(new Date(t.created_at), 'yyyy-MM-dd') === today);
      const totalRevenue = txList.reduce((s, t) => s + (Number(t.total) || 0), 0);
      const todayRevenue = todayTx.reduce((s, t) => s + (Number(t.total) || 0), 0);

      setStats({
        totalToday: todayTx.length,
        totalAllTime: txAll.length,
        revenue30d: totalRevenue,
        todayRevenue,
        waiting: txList.filter(t => t.status === 'waiting').length,
      });

      // Build last 7 days chart
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const day = subDays(new Date(), 6 - i);
        const key = format(day, 'yyyy-MM-dd');
        const dayTx = txList.filter(t => format(new Date(t.created_at), 'yyyy-MM-dd') === key);
        return {
          day: format(day, 'EEE'),
          transactions: dayTx.length,
          revenue: dayTx.reduce((s, t) => s + (Number(t.total) || 0), 0),
        };
      });
      setChartData(last7);

      // Recent transactions
      setRecentTx(txList.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    import('../utils/socket').then(({ socket }) => {
      const handleUpdate = () => {
        fetchData();
      };
      socket.on('queueUpdated', handleUpdate);
      socket.on('adminEvent', handleUpdate);
      
      return () => {
        socket.off('queueUpdated', handleUpdate);
        socket.off('adminEvent', handleUpdate);
      };
    });
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          {selectedBranch ? `${selectedBranch.name} Dashboard` : 'All Branches Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time overview for {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Transactions"
          value={stats?.totalToday ?? 0}
          icon={Camera}
          bgClass="bg-violet-500/10"
          colorClass="text-violet-600"
        />
        <StatCard
          title="Today's Revenue"
          value={`Rp ${(stats?.todayRevenue ?? 0).toLocaleString('id-ID')}`}
          icon={DollarSign}
          bgClass="bg-emerald-500/10"
          colorClass="text-emerald-600"
        />
        <StatCard
          title="Queue Waiting"
          value={stats?.waiting ?? 0}
          icon={Activity}
          bgClass="bg-orange-500/10"
          colorClass="text-orange-500"
        />
        <StatCard
          title="Revenue (30 Days)"
          value={`Rp ${((stats?.revenue30d ?? 0) / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          bgClass="bg-blue-500/10"
          colorClass="text-blue-600"
        />
      </div>

      {/* Target Progress */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="text-xl font-bold">Daily Revenue Target</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Track your progress for {format(new Date(), 'dd MMM yyyy')}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">
                  {Math.min(100, ((stats?.todayRevenue || 0) / dailyTarget) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground font-medium">Rp {(stats?.todayRevenue || 0).toLocaleString('id-ID')} / Rp {dailyTarget.toLocaleString('id-ID')}</div>
              </div>
            </div>
            <div className="w-full bg-secondary/60 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full relative"
                style={{ width: `${Math.min(100, Math.max(0, ((stats?.todayRevenue || 0) / dailyTarget) * 100))}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%,rgba(255,255,255,0.2)_100%)] bg-[length:20px_20px] animate-[pulse_2s_linear_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold">Transactions — Last 7 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={32} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', fontSize: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v) => [v, 'Transactions']}
                cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
              />
              <Bar dataKey="transactions" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-bold">Revenue — Last 7 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', fontSize: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`Rp ${v.toLocaleString('id-ID')}`, 'Revenue']}
              />
              <Line dataKey="revenue" type="monotone" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))' }} activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-bold">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                <th className="pb-3 text-left font-semibold">Invoice</th>
                <th className="pb-3 text-left font-semibold">Customer</th>
                <th className="pb-3 text-left font-semibold">Theme</th>
                {!selectedBranch && <th className="pb-3 text-left font-semibold">Branch</th>}
                <th className="pb-3 text-right font-semibold">Total</th>
                <th className="pb-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentTx.map(tx => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-mono text-xs text-muted-foreground">{tx.invoice_number}</td>
                  <td className="py-3 font-medium">{tx.customer_name}</td>
                  <td className="py-3 text-muted-foreground">{tx.theme || 'Cafe'}</td>
                  {!selectedBranch && (
                    <td className="py-3 text-muted-foreground">{tx.branch?.name}</td>
                  )}
                  <td className="py-4 text-right font-bold text-foreground">
                    Rp {Number(tx.total).toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      tx.status === 'done' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                      tx.status === 'waiting' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}>
                      {tx.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTx.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                      <CalendarDays className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    No transactions yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
