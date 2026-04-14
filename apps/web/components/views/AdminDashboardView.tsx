'use client';

import { Activity, Users, TrendingUp, Zap, AlertCircle, Database, Settings2, BarChart3 } from 'lucide-react';

export function AdminDashboardView() {
  const systemMetrics = [
    { label: 'Active Players', value: '2,847', change: '+12.5%', icon: Users, color: '#10B981', trend: [40, 50, 45, 65, 75, 85, 95] },
    { label: 'Live Matches', value: '4', change: '+2', icon: Activity, color: '#EF4444', trend: [20, 30, 25, 40, 35, 40, 45] },
    { label: 'Total TVL', value: '◈ 45.2M', change: '+8.3%', icon: TrendingUp, color: '#2563EB', trend: [30, 45, 40, 60, 70, 80, 90] },
    { label: 'System Health', value: '98.7%', change: '+0.2%', icon: Zap, color: '#F5A623', trend: [85, 90, 92, 95, 97, 98, 99] },
  ];

  const healthCards = [
    { 
      title: 'Network Status', 
      status: 'OPTIMAL',
      statusColor: '#10B981',
      metrics: [
        { label: 'Uptime', value: '99.98%', subtext: 'past 30 days' },
        { label: 'Latency', value: '42ms', subtext: 'p95 response time' },
        { label: 'RPC Calls', value: '15.2k/min', subtext: 'current load' },
      ],
      color: 'from-[#10B981]/10 to-transparent border-[#10B981]/20' 
    },
    {
      title: 'Smart Contracts',
      status: 'VERIFIED',
      statusColor: '#2563EB',
      metrics: [
        { label: 'Total Contracts', value: '8', subtext: 'deployed' },
        { label: 'Audited', value: '8/8', subtext: '100% audited' },
        { label: 'Security Score', value: '9.8/10', subtext: 'excellent' },
      ],
      color: 'from-[#2563EB]/10 to-transparent border-[#2563EB]/20'
    },
    {
      title: 'Data Pipeline',
      status: 'HEALTHY',
      statusColor: '#8B5CF6',
      metrics: [
        { label: 'Processed Events', value: '2.3M', subtext: 'this week' },
        { label: 'Queue Depth', value: '124', subtext: 'current backlog' },
        { label: 'Error Rate', value: '0.02%', subtext: 'very low' },
      ],
      color: 'from-[#8B5CF6]/10 to-transparent border-[#8B5CF6]/20'
    },
  ];

  const recentActivity = [
    { event: 'New Contest Created', user: 'Admin Panel', time: '2 mins ago', status: 'success' },
    { event: 'Score Update Pushed', user: 'Automation', time: '4 mins ago', status: 'success' },
    { event: 'NFT Minted', user: 'Player: user_2847', time: '8 mins ago', status: 'success' },
    { event: 'Treasury Withdrawal', user: 'Finance Team', time: '12 mins ago', status: 'success' },
    { event: 'Protocol Upgrade Scheduled', user: 'Dev Team', time: '28 mins ago', status: 'info' },
  ];

  // Sparkline renderer
  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 100 - (val / max) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="40" viewBox="0 0 100 100" className="mt-2" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-gradient-to-br from-[#FAFAFA] via-white to-[#F0FDF4]/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F1117] mb-2">Admin Dashboard</h1>
          <p className="text-[#5B6B7A] text-lg">System overview, operational metrics, and real-time monitoring</p>
        </div>

        {/* KPI Grid with Sparklines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {systemMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-card hover:shadow-elevated transition-smooth group hover:-translate-y-1"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${idx * 100}ms forwards`,
                  opacity: 0,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: metric.color }} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
                    {metric.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-[#0F1117] mb-1 tabular-nums">{metric.value}</p>
                <p className="text-xs text-[#5B6B7A] font-medium">{metric.label}</p>
                
                {/* Sparkline */}
                <div style={{ color: metric.color }} className="opacity-60 group-hover:opacity-100 transition-opacity">
                  {renderSparkline(metric.trend)}
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {healthCards.map((card, idx) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.color} border rounded-xl p-6 shadow-card hover:shadow-elevated transition-smooth`}
              style={{
                animation: `fadeInUp 0.4s ease-out ${400 + idx * 100}ms forwards`,
                opacity: 0,
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#0F1117] text-lg">{card.title}</h3>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white" style={{ color: card.statusColor }}>
                  {card.status}
                </span>
              </div>

              <div className="space-y-4">
                {card.metrics.map((metric) => (
                  <div key={metric.label} className="border-t border-[#E5E7EB]/20 pt-4 first:border-t-0 first:pt-0">
                    <p className="text-xs text-[#5B6B7A] font-semibold uppercase mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-[#0F1117]">{metric.value}</p>
                    <p className="text-xs text-[#5B6B7A] mt-1">{metric.subtext}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="p-6 border-b border-[#E5E7EB] flex items-center gap-2 bg-gradient-to-r from-[#FAFAFA] to-white">
            <Activity className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-lg font-bold text-[#0F1117]">Recent Activity</h2>
            <span className="ml-auto text-xs font-bold bg-[#EF4444]/10 text-[#EF4444] px-2 py-1 rounded">3 NEW</span>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-[#FAFAFA] transition-smooth group"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${800 + idx * 100}ms forwards`,
                  opacity: 0,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: activity.status === 'success' ? '#10B981' : '#2563EB' }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F1117] group-hover:text-[#10B981] transition-smooth">{activity.event}</p>
                      <p className="text-xs text-[#5B6B7A] mt-0.5">{activity.user} · {activity.time}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#2563EB]/10 text-[#2563EB]'
                    }`}
                  >
                    {activity.status === 'success' ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
          <button className="p-6 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-elevated transition-smooth text-left group shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="font-bold text-[#0F1117]">Manage Contests</h3>
            </div>
            <p className="text-sm text-[#5B6B7A]">Create, monitor, and configure active contests</p>
          </button>

          <button className="p-6 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-elevated transition-smooth text-left group shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#0F1117]">View Alerts</h3>
                <span className="text-xs font-bold bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded">3</span>
              </div>
            </div>
            <p className="text-sm text-[#5B6B7A]">System alerts and critical notifications</p>
          </button>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
