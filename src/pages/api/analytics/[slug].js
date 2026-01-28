import { db } from '../../../lib/db.ts';

export const prerender = false;

// Hole Analytics-Daten für einen Kanal
export async function GET({ params }) {
  const { slug } = params;

  try {
    // Get analytics data for the channel (all data, oldest first)
    const analytics = db.prepare(`
      SELECT * FROM channel_analytics
      WHERE channel_slug = ?
      ORDER BY date ASC
    `).all(slug);

    // Get import history
    const imports = db.prepare(`
      SELECT * FROM import_logs
      WHERE channel_slug = ?
      ORDER BY import_date DESC
      LIMIT 10
    `).all(slug);

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
    `).get(slug);

    return new Response(JSON.stringify({
      success: true,
      channel: slug,
      analytics: analytics, // Already in chronological order (oldest first)
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
