"use client";

import { useState, useEffect, useMemo } from "react";
import useAuthToken from "@/hooks/useAuthToken";
import useMonitorsSWR from "@/hooks/useMonitorsSWR";
import Chart from "@/components/ui/Chart";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { 
  BarChartIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  ActivityIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ZapIcon
} from "lucide-react";

export default function AnalyticsPage() {
  const { token, loading } = useAuthToken();
  const { monitors } = useMonitorsSWR();
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    uptimeHistory: [],
    responseTimeHistory: [],
    alertsHistory: [],
    monitorStats: [],
    loading: true
  });
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d

  useEffect(() => {
    if (!token || loading || !monitors.length) return;
    
    async function fetchAnalytics() {
      setAnalyticsData(prev => ({ ...prev, loading: true }));
      
      try {
        // Fetch overview stats
        const overviewRes = await fetch(`http://localhost:5000/api/analytics/overview?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch uptime history
        const uptimeRes = await fetch(`http://localhost:5000/api/analytics/uptime-history?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch response time history
        const responseTimeRes = await fetch(`http://localhost:5000/api/analytics/response-time?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch alerts history
        const alertsRes = await fetch(`http://localhost:5000/api/analytics/alerts-history?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch per-monitor stats
        const monitorStatsRes = await fetch(`http://localhost:5000/api/analytics/monitor-stats?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Parse responses or use mock data if endpoints don't exist
        const overview = overviewRes.ok ? await overviewRes.json() : getMockOverview();
        const uptimeHistory = uptimeRes.ok ? await uptimeRes.json() : getMockUptimeHistory();
        const responseTimeHistory = responseTimeRes.ok ? await responseTimeRes.json() : getMockResponseTimeHistory();
        const alertsHistory = alertsRes.ok ? await alertsRes.json() : getMockAlertsHistory();
        const monitorStats = monitorStatsRes.ok ? await monitorStatsRes.json() : getMockMonitorStats();

        setAnalyticsData({
          overview,
          uptimeHistory,
          responseTimeHistory,
          alertsHistory,
          monitorStats,
          loading: false
        });
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        // Use mock data on error
        setAnalyticsData({
          overview: getMockOverview(),
          uptimeHistory: getMockUptimeHistory(),
          responseTimeHistory: getMockResponseTimeHistory(),
          alertsHistory: getMockAlertsHistory(),
          monitorStats: getMockMonitorStats(),
          loading: false
        });
      }
    }

    fetchAnalytics();
  }, [token, loading, monitors, timeRange]);

  // Mock data generators (for when backend endpoints don't exist yet)
  const getMockOverview = () => ({
    totalMonitors: monitors.length,
    activeMonitors: Math.floor(monitors.length * 0.85),
    avgUptime: 99.2,
    totalAlerts: 23,
    avgResponseTime: 245,
    downtimeEvents: 4,
    uptimeChange: 2.1,
    responseTimeChange: -12.5,
    alertsChange: -8.3
  });

  const getMockUptimeHistory = () => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      timestamp: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
      uptime: 95 + Math.random() * 5,
      downtime: Math.random() * 5
    }));
  };

  const getMockResponseTimeHistory = () => {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 2160;
    return Array.from({ length: Math.min(hours, 100) }, (_, i) => ({
      timestamp: new Date(Date.now() - (hours - i) * 60 * 60 * 1000).toISOString(),
      avg: 200 + Math.random() * 100,
      p95: 300 + Math.random() * 150,
      p99: 500 + Math.random() * 200
    }));
  };

  const getMockAlertsHistory = () => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 5),
      resolved: Math.floor(Math.random() * 8)
    }));
  };

  const getMockMonitorStats = () => {
    return monitors.slice(0, 10).map(monitor => ({
      id: monitor.id,
      url: monitor.url,
      uptime: 95 + Math.random() * 5,
      avgResponseTime: 200 + Math.random() * 200,
      totalAlerts: Math.floor(Math.random() * 10),
      status: Math.random() > 0.1 ? 'UP' : 'DOWN'
    }));
  };

  // Chart configurations
  const chartTheme = {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
    pointBackgroundColor: '#8b5cf6',
    pointBorderColor: '#ffffff',
    gridColor: 'rgba(139, 92, 246, 0.1)',
    textColor: '#e2e8f0'
  };

  const uptimeChartData = useMemo(() => ({
    labels: analyticsData.uptimeHistory.map(d => 
      new Date(d.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Uptime %',
        data: analyticsData.uptimeHistory.map(d => d.uptime),
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  }), [analyticsData.uptimeHistory]);

  const responseTimeChartData = useMemo(() => ({
    labels: analyticsData.responseTimeHistory.map(d => 
      new Date(d.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: timeRange === '24h' ? '2-digit' : undefined
      })
    ),
    datasets: [
      {
        label: 'Average',
        data: analyticsData.responseTimeHistory.map(d => d.avg),
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      },
      {
        label: '95th Percentile',
        data: analyticsData.responseTimeHistory.map(d => d.p95),
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderColor: '#f97316',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  }), [analyticsData.responseTimeHistory, timeRange]);

  const alertsChartData = useMemo(() => ({
    labels: analyticsData.alertsHistory.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Critical',
        data: analyticsData.alertsHistory.map(d => d.critical),
        backgroundColor: '#ef4444',
        borderRadius: 4
      },
      {
        label: 'Warning',
        data: analyticsData.alertsHistory.map(d => d.warning),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      },
      {
        label: 'Resolved',
        data: analyticsData.alertsHistory.map(d => d.resolved),
        backgroundColor: '#22c55e',
        borderRadius: 4
      }
    ]
  }), [analyticsData.alertsHistory]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e2e8f0',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  if (loading || analyticsData.loading) {
    return (
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-12 px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--color-surface)] bg-opacity-60 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[var(--color-surface)] bg-opacity-60 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-[var(--color-surface)] bg-opacity-60 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto mt-12 px-6">
      <ScrollReveal>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChartIcon className="w-8 h-8 text-[var(--color-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-[var(--color-surface)] bg-opacity-80 rounded-lg p-1">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  timeRange === range 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Total Monitors</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {analyticsData.overview?.totalMonitors || 0}
                </p>
              </div>
              <ActivityIcon className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
          </div>

          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Average Uptime</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-500">
                    {analyticsData.overview?.avgUptime?.toFixed(1) || 0}%
                  </p>
                  {analyticsData.overview?.uptimeChange > 0 ? (
                    <TrendingUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Avg Response Time</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {analyticsData.overview?.avgResponseTime || 0}ms
                  </p>
                  {analyticsData.overview?.responseTimeChange < 0 ? (
                    <TrendingDownIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingUpIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <ClockIcon className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
          </div>

          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Total Alerts</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-orange-500">
                    {analyticsData.overview?.totalAlerts || 0}
                  </p>
                  {analyticsData.overview?.alertsChange < 0 ? (
                    <TrendingDownIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingUpIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <AlertTriangleIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Uptime Chart */}
          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              Uptime Percentage
            </h3>
            <Chart
              type="line"
              data={uptimeChartData}
              options={chartOptions}
              height={300}
            />
          </div>

          {/* Response Time Chart */}
          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <ZapIcon className="w-5 h-5 text-[var(--color-primary)]" />
              Response Time
            </h3>
            <Chart
              type="line"
              data={responseTimeChartData}
              options={chartOptions}
              height={300}
            />
          </div>

          {/* Alerts Chart */}
          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
              Alerts History
            </h3>
            <Chart
              type="bar"
              data={alertsChartData}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: {
                    ...chartOptions.scales.x,
                    stacked: true
                  },
                  y: {
                    ...chartOptions.scales.y,
                    stacked: true
                  }
                }
              }}
              height={300}
            />
          </div>

          {/* Monitor Status Distribution */}
          <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-[var(--color-primary)]" />
              Monitor Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-[var(--color-text-primary)]">Active</span>
                </div>
                <span className="font-semibold text-green-500">
                  {analyticsData.overview?.activeMonitors || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[var(--color-text-primary)]">Down</span>
                </div>
                <span className="font-semibold text-red-500">
                  {(analyticsData.overview?.totalMonitors || 0) - (analyticsData.overview?.activeMonitors || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-[var(--color-text-primary)]">Incidents</span>
                </div>
                <span className="font-semibold text-orange-500">
                  {analyticsData.overview?.downtimeEvents || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monitor Performance Table */}
        <div className="bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-sm rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-[var(--color-primary)]" />
              Monitor Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)] bg-opacity-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Monitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Avg Response
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Alerts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {analyticsData.monitorStats.map((monitor, index) => (
                  <tr key={monitor.id} className="hover:bg-[var(--color-hover)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">
                        {monitor.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {monitor.status === 'UP' ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          monitor.status === 'UP' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {monitor.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                      {monitor.uptime.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                      {Math.round(monitor.avgResponseTime)}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                      {monitor.totalAlerts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
