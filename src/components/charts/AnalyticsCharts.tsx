import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface AnalyticsData {
  date: string;
  subscribers: number;
  views: number;
  videos: number;
  avg_views_per_video: number;
}

interface ChartsProps {
  slug: string;
}

export default function AnalyticsCharts({ slug }: ChartsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscribersChartRef = useRef<HTMLCanvasElement>(null);
  const viewsChartRef = useRef<HTMLCanvasElement>(null);
  const engagementChartRef = useRef<HTMLCanvasElement>(null);

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

    const dates = analytics.map(a => a.date);
    const subscribers = analytics.map(a => a.subscribers);
    const views = analytics.map(a => a.views);
    const avgViews = analytics.map(a => a.avg_views_per_video);

    const chartConfig = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { size: 12 }
          }
        }
      },
      scales: {
        y: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };

    // Subscribers Chart
    if (subscribersChartRef.current) {
      const ctx = subscribersChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: 'Subscribers',
              data: subscribers,
              borderColor: '#00D4FF',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }]
          },
          options: chartConfig as any
        });
        chartsRef.current.push(chart);
      }
    }

    // Views Chart
    if (viewsChartRef.current) {
      const ctx = viewsChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: 'Total Views',
              data: views,
              borderColor: '#00FF88',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }]
          },
          options: chartConfig as any
        });
        chartsRef.current.push(chart);
      }
    }

    // Avg Views Per Video Chart
    if (engagementChartRef.current) {
      const ctx = engagementChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: 'Avg Views per Video',
              data: avgViews,
              borderColor: '#FFB800',
              backgroundColor: 'rgba(255, 184, 0, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }]
          },
          options: chartConfig as any
        });
        chartsRef.current.push(chart);
      }
    }

    return () => {
      chartsRef.current.forEach(chart => chart.destroy());
    };
  }, [analytics, loading]);

  if (loading) {
    return <div className="loading-message">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (analytics.length === 0) {
    return <div className="info-message">No analytics data available yet. Import data to get started.</div>;
  }

  return (
    <div className="analytics-charts">
      <div className="chart-container">
        <h3>Subscriber Growth</h3>
        <canvas ref={subscribersChartRef}></canvas>
      </div>

      <div className="chart-container">
        <h3>Total Views Over Time</h3>
        <canvas ref={viewsChartRef}></canvas>
      </div>

      <div className="chart-container">
        <h3>Average Views Per Video</h3>
        <canvas ref={engagementChartRef}></canvas>
      </div>

      <style>{`
        .analytics-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .chart-container {
          background: linear-gradient(180deg, rgba(16, 23, 48, 0.9), rgba(9, 12, 30, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.3);
        }

        .chart-container h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
        }

        .chart-container canvas {
          height: 300px !important;
        }

        .loading-message,
        .error-message,
        .info-message {
          padding: 2rem;
          text-align: center;
          border-radius: 12px;
          background: rgba(16, 23, 48, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          margin-top: 2rem;
        }

        .error-message {
          border-color: rgba(255, 100, 100, 0.3);
          color: rgba(255, 150, 150, 0.9);
        }
      `}</style>
    </div>
  );
}
