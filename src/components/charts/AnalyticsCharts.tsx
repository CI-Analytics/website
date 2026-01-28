import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface YouTubeAnalyticsData {
  date: string;
  daily_views: number;
  daily_subscribers: number;
  daily_uploads: number;
}

interface MinecraftAnalyticsData {
  date: string;
  daily_user: number;
  daily_peak_online: number;
  weekly_user: number;
  alltime_user: number;
  daily_sessions: number;
}

type AnalyticsData = YouTubeAnalyticsData | MinecraftAnalyticsData;

interface ChartsProps {
  slug: string;
  dataType?: string;
}

// Detect server type from slug or dataType prop
function getServerType(slug: string, dataType?: string): 'youtube' | 'minecraft' {
  if (dataType) {
    return dataType.toLowerCase().includes('minecraft') ? 'minecraft' : 'youtube';
  }
  const minecraftSlugs = ['msb', 'ycb', 'boom'];
  return minecraftSlugs.includes(slug) ? 'minecraft' : 'youtube';
}

export default function AnalyticsCharts({ slug, dataType }: ChartsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const serverType = getServerType(slug, dataType);

  // YouTube chart refs
  const subscribersChartRef = useRef<HTMLCanvasElement>(null);
  const viewsChartRef = useRef<HTMLCanvasElement>(null);
  const engagementChartRef = useRef<HTMLCanvasElement>(null);

  // Minecraft chart refs
  const dailyUserChartRef = useRef<HTMLCanvasElement>(null);
  const peakOnlineChartRef = useRef<HTMLCanvasElement>(null);
  const sessionsChartRef = useRef<HTMLCanvasElement>(null);

  const chartsRef = useRef<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/${slug}`);
        const data = await response.json() as any;

        if (!data.success) {
          setError(data.error || 'Failed to fetch analytics');
          setLoading(false);
          return;
        }

        setAnalytics(data.analytics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug]);

  useEffect(() => {
    if (analytics.length === 0 || loading) return;

    // Cleanup old charts
    chartsRef.current.forEach(chart => chart.destroy());
    chartsRef.current = [];

    // Alle Daten für Labels, Chart.js wird automatisch filtern
    const dates = analytics.map(a => a.date);

    const baseChartConfig = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { size: 12 }
          }
        },
        filler: {
          propagate: true
        }
      },
      scales: {
        y: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          beginAtZero: false
        },
        x: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            maxRotation: 45,
            minRotation: 45,
            maxTicksLimit: 8,
            autoSkip: true
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };

    if (serverType === 'youtube') {
      const youtubeData = analytics as YouTubeAnalyticsData[];
      const dailyViews = youtubeData.map(a => a.daily_views || 0);
      const dailySubscribers = youtubeData.map(a => a.daily_subscribers || 0);
      const dailyUploads = youtubeData.map(a => a.daily_uploads || 0);

      const totalSubscribers = dailySubscribers.reduce((acc: number[], val) => {
        const last = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(last + (val || 0));
        return acc;
      }, []);

      const totalViews = dailyViews.reduce((acc: number[], val) => {
        const last = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(last + (val || 0));
        return acc;
      }, []);

      const totalVideos = dailyUploads.reduce((acc: number[], val) => {
        const last = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(last + (val || 0));
        return acc;
      }, []);

      // Total Subscribers Chart
      if (subscribersChartRef.current) {
        const ctx = subscribersChartRef.current.getContext('2d');
        if (ctx) {
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'Total Subscribers',
                data: totalSubscribers,
                borderColor: '#00D4FF',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                tension: 0.2,
                fill: true
              }]
            },
            options: {
              ...baseChartConfig,
              scales: {
                ...baseChartConfig.scales,
                y: {
                  ...baseChartConfig.scales.y,
                  beginAtZero: false
                }
              }
            } as any
          });
          chartsRef.current.push(chart);
        }
      }

      // Total Views Chart
      if (viewsChartRef.current) {
        const ctx = viewsChartRef.current.getContext('2d');
        if (ctx) {
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'Total Views',
                data: totalViews,
                borderColor: '#00FF88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                tension: 0.2,
                fill: true
              }]
            },
            options: baseChartConfig as any
          });
          chartsRef.current.push(chart);
        }
      }

      // Total Videos Chart
      if (engagementChartRef.current) {
        const ctx = engagementChartRef.current.getContext('2d');
        if (ctx) {
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'Total Videos',
                data: totalVideos,
                borderColor: '#FFB800',
                backgroundColor: 'rgba(255, 184, 0, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                tension: 0.2,
                fill: true
              }]
            },
            options: baseChartConfig as any
          });
          chartsRef.current.push(chart);
        }
      }
    } else {
      // Minecraft charts
      const minecraftData = analytics as MinecraftAnalyticsData[];
      const dailyUsers = minecraftData.map(a => a.daily_user);
      const peakOnline = minecraftData.map(a => a.daily_peak_online);
      const dailySessions = minecraftData.map(a => a.daily_sessions);

      // Daily Users Chart
      if (dailyUserChartRef.current) {
        const ctx = dailyUserChartRef.current.getContext('2d');
        if (ctx) {
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'Daily Users',
                data: dailyUsers,
                borderColor: '#00D4FF',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                tension: 0.2,
                fill: true
              }]
            },
            options: baseChartConfig as any
          });
          chartsRef.current.push(chart);
        }
      }

      // Peak Online Chart
      if (peakOnlineChartRef.current) {
        const ctx = peakOnlineChartRef.current.getContext('2d');
        if (ctx) {
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'Peak Online Players',
                data: peakOnline,
                borderColor: '#00FF88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                tension: 0.2,
                fill: true
              }]
            },
            options: baseChartConfig as any
          });
          chartsRef.current.push(chart);
        }
      }

      // Daily Sessions Chart
      if (sessionsChartRef.current) {
        const ctx = sessionsChartRef.current.getContext('2d');
        if (ctx) {
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'Daily Sessions',
                data: dailySessions,
                borderColor: '#FFB800',
                backgroundColor: 'rgba(255, 184, 0, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                tension: 0.2,
                fill: true
              }]
            },
            options: baseChartConfig as any
          });
          chartsRef.current.push(chart);
        }
      }
    }

    return () => {
      chartsRef.current.forEach(chart => chart.destroy());
    };
  }, [analytics, loading, serverType]);

  if (loading) {
    return (
      <div className="charts-container">
        <p className="loading">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-container">
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="charts-container">
        <p className="empty">No analytics data yet. Import data to see charts.</p>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <div className="charts-grid">
        {serverType === 'youtube' ? (
          <>
            <div className="chart-box">
              <h4>Total Subscribers</h4>
              <div className="chart-wrapper">
                <canvas ref={subscribersChartRef}></canvas>
              </div>
            </div>
            <div className="chart-box">
              <h4>Total Views</h4>
              <div className="chart-wrapper">
                <canvas ref={viewsChartRef}></canvas>
              </div>
            </div>
            <div className="chart-box">
              <h4>Total Videos</h4>
              <div className="chart-wrapper">
                <canvas ref={engagementChartRef}></canvas>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="chart-box">
              <h4>Daily Users</h4>
              <div className="chart-wrapper">
                <canvas ref={dailyUserChartRef}></canvas>
              </div>
            </div>
            <div className="chart-box">
              <h4>Peak Online Players</h4>
              <div className="chart-wrapper">
                <canvas ref={peakOnlineChartRef}></canvas>
              </div>
            </div>
            <div className="chart-box">
              <h4>Daily Sessions</h4>
              <div className="chart-wrapper">
                <canvas ref={sessionsChartRef}></canvas>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .charts-container {
          width: 100%;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .chart-box {
          background: rgba(0, 10, 30, 0.6);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .chart-box h4 {
          margin: 0 0 1rem 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
        }

        .chart-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          min-height: 200px;
        }

        .loading, .error, .empty {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          padding: 2rem;
          font-size: 0.95rem;
        }

        .error {
          color: rgba(255, 150, 150, 0.8);
        }
      `}</style>
    </div>
  );
}

