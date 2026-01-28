import { db } from '../../lib/db';

// Hole Analytics-Daten für einen Kanal
export async function GET({ params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    // Get analytics data for the channel (last 90 days)
    const analytics = db.prepare(`
      SELECT * FROM channel_analytics
      WHERE channel_slug = ?
      ORDER BY date DESC
      LIMIT 90
    `).all(slug) as any[];

    // Get import history
    const imports = db.prepare(`
      SELECT * FROM import_logs
      WHERE channel_slug = ?
      ORDER BY import_date DESC
      LIMIT 10
    `).all(slug) as any[];

    // Get summary stats
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_records,
        MAX(date) as last_update,
        AVG(subscribers) as avg_subscribers,
        MAX(subscribers) as max_subscribers,
        AVG(views) as avg_views,
        MAX(views) as max_views
      FROM channel_analytics
      WHERE channel_slug = ?
    `).get(slug) as any;

    return new Response(JSON.stringify({
      success: true,
      channel: slug,
      analytics: analytics.reverse(), // Chronologische Reihenfolge (älteste zuerst)
      imports,
      summary
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Query error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
