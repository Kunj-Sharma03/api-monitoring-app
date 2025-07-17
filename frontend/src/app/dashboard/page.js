'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useMonitorsSWR from '@/hooks/useMonitorsSWR';
import useAuthToken from '@/hooks/useAuthToken';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Chart from '@/components/ui/Chart';
import SplitText from '@/components/ui/SplitText';
import { useRouter } from 'next/navigation';
import { MonitorIcon, Activity, AlertTriangle, TrendingUp, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    overview: null,
    uptimeHistory: [],
    responseTime: [],
    alertsHistory: [],
    loading: true
  });
  const [timeRange, setTimeRange] = useState('7d');

  const { token } = useAuthToken();
  const { monitors, isLoading } = useMonitorsSWR();

  // Fetch analytics data
  useEffect(() => {
    if (!token) return;
    
    const fetchAnalytics = async () => {
      setAnalytics(prev => ({ ...prev, loading: true }));
      
      try {
        console.log('Fetching analytics data for range:', timeRange);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-monitoring-app-production.up.railway.app';
        const [overviewRes, uptimeRes, responseRes, alertsRes] = await Promise.all([
          fetch(`${apiUrl}/api/analytics/overview?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/api/analytics/uptime-history?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/api/analytics/response-time?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/api/analytics/alerts-history?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        console.log('Analytics API responses:', {
          overview: overviewRes.status,
          uptime: uptimeRes.status,
          response: responseRes.status,
          alerts: alertsRes.status
        });

        const [overview, uptimeHistory, responseTime, alertsHistory] = await Promise.all([
          overviewRes.ok ? overviewRes.json() : null,
          uptimeRes.ok ? uptimeRes.json() : { data: [] },
          responseRes.ok ? responseRes.json() : { data: [] },
          alertsRes.ok ? alertsRes.json() : { data: [] }
        ]);

        console.log('Parsed analytics data:', {
          overview,
          uptimeHistory: uptimeHistory.data?.length || 0,
          responseTime: responseTime.data?.length || 0,
          alertsHistory: alertsHistory.data?.length || 0
        });

        setAnalytics({
          overview,
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Memoize SplitText animation props to prevent infinite re-renders
  const splitTextFrom = useMemo(() => ({ opacity: 0, y: 40 }), []);
  const splitTextTo = useMemo(() => ({ opacity: 1, y: 0 }), []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <main className="flex-1 px-4 md:px-8 py-6 md:py-10 pt-16 md:pt-10 bg-[var(--color-bg)] bg-opacity-80 min-h-screen">
        {/* Hero Section - Always Visible */}
        <div className="relative flex flex-col items-center justify-center w-full min-h-screen">
          {/* Logout button top right */}
          <button
            onClick={handleLogout}
            className="absolute right-8 top-8 bg-[var(--color-error)] text-[var(--color-text-primary)] px-4 py-2 rounded hover:bg-red-600 transition-colors text-base font-medium z-10"
          >
            Logout
          </button>
          
          {/* Main Content */}
          <div className="flex flex-col items-center justify-center w-full h-full -mt-16">
            <SplitText
              text="Hello, User!"
              className="text-4xl font-bold font-sans text-center mb-6"
              delay={60}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={splitTextFrom}
              to={splitTextTo}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
            
            {/* Main Stats - Total and Active Monitors */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 items-center justify-center z-10">
              <div className="flex flex-col items-center gap-1 bg-[var(--color-surface)] bg-opacity-80 border border-[var(--color-border)] rounded-lg px-8 sm:px-10 py-6 sm:py-8 min-w-[160px] sm:min-w-[180px] shadow-md">
                <MonitorIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-primary)] mb-2" />
                <span className="text-sm text-[var(--color-text-secondary)] font-sans">Total Monitors</span>
                <span className="text-2xl sm:text-3xl font-bold font-sans">{isLoading ? '...' : monitors.length}</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-[var(--color-surface)] bg-opacity-80 border border-[var(--color-border)] rounded-lg px-8 sm:px-10 py-6 sm:py-8 min-w-[160px] sm:min-w-[180px] shadow-md">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--color-success)] inline-block mb-2" />
                <span className="text-sm text-[var(--color-text-secondary)] font-sans">Active</span>
                <span className="text-2xl sm:text-3xl font-bold font-sans">{isLoading ? '...' : monitors.filter(m => m.is_active).length}</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 flex flex-col items-center animate-bounce">
            <span className="text-sm text-[var(--color-text-secondary)] mb-2 font-medium">Scroll for Analytics</span>
            <ChevronDown className="w-6 h-6 text-[var(--color-text-secondary)]" />
          </div>
        </div>

        {/* Analytics Section - Scroll Reveal */}
        <div className="w-full space-y-16 pb-32">
          {/* Time Range Selector */}
          <ScrollReveal 
            baseOpacity={0.1} 
            enableBlur={true} 
            baseRotation={1} 
            blurStrength={4}
            containerClassName="time-range-selector"
          >
            <div className="w-full max-w-7xl mx-auto flex justify-center mb-8">
              <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">Time Range:</span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-[var(--color-bg)] bg-opacity-80 border border-[var(--color-border)] text-[var(--color-text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Overview Stats */}
          <ScrollReveal 
            baseOpacity={0.1} 
            enableBlur={true} 
            baseRotation={1} 
            blurStrength={4}
            containerClassName="overview-stats"
          >
            <div className="w-full max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
                Overview Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Average Uptime */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <Activity className="w-8 h-8 text-[var(--color-success)] mx-auto mb-3" />
                  <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Average Uptime</h3>
                  <p className="text-2xl font-bold text-[var(--color-success)]">
                    {analytics.loading ? '...' : `${analytics.overview?.averageUptime || 0}%`}
                  </p>
                </div>

                {/* Response Time */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <TrendingUp className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-3" />
                  <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Avg Response Time</h3>
                  <p className="text-2xl font-bold text-[var(--color-primary)]">
                    {analytics.loading ? '...' : `${analytics.overview?.averageResponseTime || 0}ms`}
                  </p>
                </div>

                {/* Total Alerts */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-[var(--color-error)] mx-auto mb-3" />
                  <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Total Alerts</h3>
                  <p className="text-2xl font-bold text-[var(--color-error)]">
                    {analytics.loading ? '...' : analytics.overview?.totalAlerts || 0}
                  </p>
                </div>

                {/* Active Incidents */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-[var(--color-warning)] mx-auto mb-3" />
                  <h3 className="text-sm text-[var(--color-text-secondary)] mb-2">Active Incidents</h3>
                  <p className="text-2xl font-bold text-[var(--color-warning)]">
                    {analytics.loading ? '...' : analytics.overview?.activeIncidents || 0}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Uptime Trend Chart */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="w-full max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
                Uptime Trend
              </h2>
              
              <div 
                className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(240,235,255,0.38) 0%, rgba(220,210,255,0.18) 100%)',
                  minHeight: '400px'
                }}
              >
                {analytics.loading ? (
                  <div className="w-full h-[350px] flex items-center justify-center">
                    <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                  </div>
                ) : analytics.uptimeHistory.length === 0 ? (
                  <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
                    <Activity className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-secondary)] text-lg">No uptime data available</p>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-2">Data will appear once monitors start collecting metrics</p>
                  </div>
                ) : (
                  <Chart
                    type="line"
                    className="w-full h-[350px]"
                    height={350}
                    data={{
                      labels: analytics.uptimeHistory.map(item => 
                        new Date(item.time_bucket).toLocaleDateString()
                      ),
                      datasets: [{
                        label: 'Uptime %',
                        data: analytics.uptimeHistory.map(item => item.uptime_percent),
                        borderColor: 'rgba(200, 180, 255, 1)',
                        backgroundColor: 'rgba(200, 180, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgba(200, 180, 255, 1)',
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
            </div>
          </ScrollReveal>

          {/* Response Time Chart */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="w-full max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
                Response Time Trend
              </h2>
              
              <div 
                className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,245,235,0.38) 0%, rgba(255,235,210,0.18) 100%)',
                  minHeight: '400px'
                }}
              >
                {analytics.loading ? (
                  <div className="w-full h-[350px] flex items-center justify-center">
                    <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                  </div>
                ) : analytics.responseTime.length === 0 ? (
                  <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
                    <TrendingUp className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-secondary)] text-lg">No response time data available</p>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-2">Data will appear once monitors start collecting metrics</p>
                  </div>
                ) : (
                  <Chart
                    type="line"
                    className="w-full h-[350px]"
                    height={350}
                    data={{
                      labels: analytics.responseTime.map(item => 
                        new Date(item.time_bucket).toLocaleDateString()
                      ),
                      datasets: [{
                        label: 'Response Time (ms)',
                        data: analytics.responseTime.map(item => item.avg_response_time),
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgba(255, 159, 64, 1)',
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
            </div>
          </ScrollReveal>

          {/* Alerts History Chart */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="w-full max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
                Alerts History
              </h2>
              
              <div 
                className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,235,235,0.38) 0%, rgba(255,210,210,0.18) 100%)',
                  minHeight: '400px'
                }}
              >
                {analytics.loading ? (
                  <div className="w-full h-[350px] flex items-center justify-center">
                    <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                  </div>
                ) : analytics.alertsHistory.length === 0 ? (
                  <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-secondary)] text-lg">No alerts data available</p>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-2">Data will appear when alerts are triggered</p>
                  </div>
                ) : (
                  <Chart
                    type="bar"
                    className="w-full h-[350px]"
                    height={350}
                    data={{
                      labels: analytics.alertsHistory.map(item => 
                        new Date(item.time_bucket).toLocaleDateString()
                      ),
                      datasets: [{
                        label: 'Alerts',
                        data: analytics.alertsHistory.map(item => item.alert_count),
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
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
            </div>
          </ScrollReveal>

          {/* Call to Action */}
          <ScrollReveal baseOpacity={0.05} enableBlur={true} baseRotation={2} blurStrength={6} animationEnd="bottom bottom">
            <div className="w-full max-w-4xl mx-auto text-center py-24">
              <h2 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)]">
                Ready to dive deeper?
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8">
                Explore detailed per-monitor analytics, manage your monitors, and view comprehensive reports.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard/analytics')}
                  className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all"
                >
                  Detailed Analytics
                </button>
                <button
                  onClick={() => router.push('/dashboard/monitors')}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-8 py-3 rounded-lg font-medium hover:bg-opacity-80 transition-all"
                >
                  Manage Monitors
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
