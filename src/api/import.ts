import { db } from '../lib/db';

// Typen für Analytics-Daten
export interface ChannelAnalytics {
  channel_slug: string;
  date: string;
  subscribers: number;
  views: number;
  videos: number;
  avg_views_per_video: number;
  growth_rate?: number;
  engagement_rate?: number;
}

// Importiere Daten von externer API oder manuell
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { channel_slug, data } = body;

    if (!channel_slug || !Array.isArray(data)) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT INTO channel_analytics 
      (channel_slug, date, subscribers, views, videos, avg_views_per_video, growth_rate, engagement_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(channel_slug, date) DO UPDATE SET
        subscribers = excluded.subscribers,
        views = excluded.views,
        videos = excluded.videos,
        avg_views_per_video = excluded.avg_views_per_video,
        growth_rate = excluded.growth_rate,
        engagement_rate = excluded.engagement_rate
    `);

    // Begin transaction
    const insertMany = db.transaction((entries: ChannelAnalytics[]) => {
      let imported = 0;
      for (const entry of entries) {
        try {
          insertStmt.run(
            channel_slug,
            entry.date,
            entry.subscribers,
            entry.views,
            entry.videos,
            entry.avg_views_per_video,
            entry.growth_rate || null,
            entry.engagement_rate || null
          );
          imported++;
        } catch (error) {
          console.error(`Failed to insert record for ${entry.date}:`, error);
        }
      }
      return imported;
    });

    const recordsImported = insertMany(data);

    // Log the import
    db.prepare(`
      INSERT INTO import_logs (channel_slug, records_imported, api_source, status)
      VALUES (?, ?, ?, ?)
    `).run(channel_slug, recordsImported, 'manual', 'success');

    return new Response(JSON.stringify({
      success: true,
      channel_slug,
      recordsImported,
      message: `Successfully imported ${recordsImported} records`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to import data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
