import { db } from '../../lib/db.ts';

export const prerender = false;

// Importiere Daten von externer API oder manuell
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { channel_slug, data } = body;

    console.log('Import request received:', { channel_slug, dataCount: data?.length });

    if (!channel_slug || !Array.isArray(data)) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure channel exists in channels table
    try {
      db.prepare(`
        INSERT OR IGNORE INTO channels (slug, name, status)
        VALUES (?, ?, ?)
      `).run(channel_slug, channel_slug, 'Active');
    } catch (channelError) {
      console.log('Channel already exists or error:', channelError);
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
    const insertMany = db.transaction((entries) => {
      let imported = 0;
      for (const entry of entries) {
        try {
          insertStmt.run(
            channel_slug,
            entry.date,
            entry.subscribers || 0,
            entry.views || 0,
            entry.videos || 0,
            entry.avg_views_per_video || 0,
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
    console.log('Records imported:', recordsImported);

    // Log the import
    try {
      db.prepare(`
        INSERT INTO import_logs (channel_slug, records_imported, api_source, status)
        VALUES (?, ?, ?, ?)
      `).run(channel_slug, recordsImported, 'manual', 'success');
    } catch (logError) {
      console.error('Failed to log import:', logError);
    }

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
