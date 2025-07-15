'use client';

import React, { useState, useEffect } from 'react';
import useMonitorsSWR from '@/hooks/useMonitorsSWR';
import useAuthToken from '@/hooks/useAuthToken';
import Chart from '@/components/ui/Chart';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Globe,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const { token } = useAuthToken();
  const { monitors, isLoading } = useMonitorsSWR();
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    overview: null,
    monitorStats: [],
    uptimeHistory: [],
    responseTime: [],
    alertsHistory: [],
    loading: true
  });
  
  const [selectedMonitor, setSelectedMonitor] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch analytics data
  useEffect(() => {
    if (!token) return;
    
    const fetchAnalytics = async () => {
      setAnalytics(prev => ({ ...prev, loading: true }));
      
      try {
        console.log('Fetching analytics data for range:', timeRange);
        
        const [overviewRes, monitorStatsRes, uptimeRes, responseRes, alertsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/analytics/overview?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/analytics/monitor-stats?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/analytics/uptime-history?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/analytics/response-time?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/analytics/alerts-history?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        console.log('Analytics API responses:', {
          overview: overviewRes.status,
          monitorStats: monitorStatsRes.status,
          uptime: uptimeRes.status,
          response: responseRes.status,
          alerts: alertsRes.status
        });

        const [overview, monitorStats, uptimeHistory, responseTime, alertsHistory] = await Promise.all([
          overviewRes.ok ? overviewRes.json() : null,
          monitorStatsRes.ok ? monitorStatsRes.json() : [],
          uptimeRes.ok ? uptimeRes.json() : { data: [] },
          responseRes.ok ? responseRes.json() : { data: [] },
          alertsRes.ok ? alertsRes.json() : { data: [] }
        ]);

        console.log('Parsed analytics data:', {
          overview,
          monitorStats: monitorStats?.length || 0,
          uptimeHistory: uptimeHistory.data?.length || 0,
          responseTime: responseTime.data?.length || 0,
          alertsHistory: alertsHistory.data?.length || 0
        });

        setAnalytics({
          overview,
          monitorStats: monitorStats || [],
          uptimeHistory: uptimeHistory.data || [],
          responseTime: responseTime.data || [],
          alertsHistory: alertsHistory.data || [],
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setAnalytics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, [token, timeRange]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <main className="flex-1 px-8 py-10 max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-[var(--color-primary)]" />
              <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl">
              Comprehensive monitoring insights, performance metrics, and detailed analytics for all your endpoints.
            </p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
          <div className="mb-8 bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-wrap items-center gap-6">
              {/* Time Range Selector */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[var(--color-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-[var(--color-bg)] bg-opacity-80 border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>

              {/* Monitor Selector */}
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[var(--color-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Monitor:</span>
                <select
                  value={selectedMonitor}
                  onChange={(e) => setSelectedMonitor(e.target.value)}
                  className="bg-[var(--color-bg)] bg-opacity-80 border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent min-w-[200px]"
                >
                  <option value="all">All Monitors</option>
                  {analytics.monitorStats.map(monitor => (
                    <option key={monitor.id} value={monitor.id}>
                      {monitor.url}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Overview Stats */}
        <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Overall Uptime */}
            <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-[var(--color-success)]" />
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUpRight className="w-3 h-3 text-[var(--color-success)]" />
                  <span className="text-[var(--color-success)]">+2.3%</span>
                </div>
              </div>
              <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Overall Uptime</h3>
              <p className="text-3xl font-bold text-[var(--color-success)]">
                {analytics.loading ? '...' : `${analytics.overview?.averageUptime || 0}%`}
              </p>
            </div>

            {/* Average Response Time */}
            <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-[var(--color-primary)]" />
                <div className="flex items-center gap-1 text-xs">
                  <ArrowDownRight className="w-3 h-3 text-[var(--color-success)]" />
                  <span className="text-[var(--color-success)]">-15ms</span>
                </div>
              </div>
              <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Avg Response Time</h3>
              <p className="text-3xl font-bold text-[var(--color-primary)]">
                {analytics.loading ? '...' : `${analytics.overview?.averageResponseTime || 0}ms`}
              </p>
            </div>

            {/* Total Incidents */}
            <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 text-[var(--color-error)]" />
                <div className="flex items-center gap-1 text-xs">
                  <ArrowDownRight className="w-3 h-3 text-[var(--color-success)]" />
                  <span className="text-[var(--color-success)]">-2</span>
                </div>
              </div>
              <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Total Incidents</h3>
              <p className="text-3xl font-bold text-[var(--color-error)]">
                {analytics.loading ? '...' : analytics.overview?.activeIncidents || 0}
              </p>
            </div>

            {/* Monitors Tracked */}
            <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-8 h-8 text-[var(--color-info)]" />
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUpRight className="w-3 h-3 text-[var(--color-success)]" />
                  <span className="text-[var(--color-success)]">+1</span>
                </div>
              </div>
              <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Monitors Tracked</h3>
              <p className="text-3xl font-bold text-[var(--color-info)]">
                {analytics.loading ? '...' : analytics.overview?.totalMonitors || 0}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Monitor Status Grid */}
        <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-3">
              <Globe className="w-6 h-6 text-[var(--color-primary)]" />
              Monitor Status Overview
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {analytics.monitorStats.map(monitor => (
                <div 
                  key={monitor.id} 
                  className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedMonitor(monitor.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {monitor.status === 'UP' ? (
                        <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[var(--color-error)]" />
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        monitor.status === 'UP' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {monitor.status}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-[var(--color-text-primary)] mb-2 truncate">
                    {monitor.url}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Uptime</span>
                      <p className="font-bold text-[var(--color-success)]">{monitor.uptime}%</p>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Response</span>
                      <p className="font-bold text-[var(--color-primary)]">{monitor.avgResponseTime}ms</p>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Alerts</span>
                      <p className="font-bold text-[var(--color-error)]">{monitor.totalAlerts}</p>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Status</span>
                      <p className="font-bold text-[var(--color-info)]">Active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Uptime Trend Chart */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-[var(--color-success)]" />
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Uptime Trend</h3>
              </div>
              
              {analytics.loading ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                </div>
              ) : analytics.uptimeHistory.length === 0 ? (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-center">
                  <Activity className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                  <p className="text-[var(--color-text-secondary)]">No uptime data available</p>
                </div>
              ) : (
                <Chart
                  type="line"
                  className="w-full h-[300px]"
                  height={300}
                  data={{
                    labels: analytics.uptimeHistory.map(item => 
                      new Date(item.time_bucket).toLocaleDateString()
                    ),
                    datasets: [{
                      label: 'Uptime %',
                      data: analytics.uptimeHistory.map(item => item.uptime_percent),
                      borderColor: 'rgba(34, 197, 94, 1)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 5
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                      },
                      x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                      }
                    }
                  }}
                />
              )}
            </div>
          </ScrollReveal>

          {/* Response Time Chart */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-[var(--color-primary)]" />
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Response Time</h3>
              </div>
              
              {analytics.loading ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                </div>
              ) : analytics.responseTime.length === 0 ? (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-center">
                  <Zap className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                  <p className="text-[var(--color-text-secondary)]">No response time data available</p>
                </div>
              ) : (
                <Chart
                  type="line"
                  className="w-full h-[300px]"
                  height={300}
                  data={{
                    labels: analytics.responseTime.map(item => 
                      new Date(item.time_bucket).toLocaleDateString()
                    ),
                    datasets: [{
                      label: 'Response Time (ms)',
                      data: analytics.responseTime.map(item => item.avg_response_time),
                      borderColor: 'rgba(59, 130, 246, 1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 5
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                      },
                      x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                      }
                    }
                  }}
                />
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Alerts History Chart */}
        <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
          <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl mb-12">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-[var(--color-error)]" />
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Alerts & Incidents History</h3>
            </div>
            
            {analytics.loading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
              </div>
            ) : analytics.alertsHistory.length === 0 ? (
              <div className="w-full h-[300px] flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                <p className="text-[var(--color-text-secondary)]">No alerts data available</p>
                <p className="text-[var(--color-text-secondary)] text-sm mt-2">Great! No incidents to report</p>
              </div>
            ) : (
              <Chart
                type="bar"
                className="w-full h-[300px]"
                height={300}
                data={{
                  labels: analytics.alertsHistory.map(item => 
                    new Date(item.time_bucket).toLocaleDateString()
                  ),
                  datasets: [{
                    label: 'Alerts',
                    data: analytics.alertsHistory.map(item => item.alert_count),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    x: {
                      grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                  }
                }}
              />
            )}
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
