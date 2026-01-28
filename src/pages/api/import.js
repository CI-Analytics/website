import { db } from '../../lib/db.ts';

export const prerender = false;

// Detect server type from slug
function getServerType(slug) {
  const minecraftSlugs = ['msb', 'ycb', 'boom'];
  return minecraftSlugs.includes(slug) ? 'minecraft' : 'youtube';
}

// Importiere Daten von externer API oder manuell
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { channel_slug, data, metricType } = body;
    const serverType = getServerType(channel_slug);

    console.log('Import request received:', { channel_slug, serverType, metricType, dataCount: data?.length });

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

    // Prepare insert statement based on server type
    let insertStmt;
    
    if (serverType === 'youtube') {
      // For YouTube, single metric import
      insertStmt = db.prepare(`
        INSERT INTO channel_analytics 
        (channel_slug, date, ${metricType})
        VALUES (?, ?, ?)
        ON CONFLICT(channel_slug, date) DO UPDATE SET
          ${metricType} = excluded.${metricType}
      `);
    } else {
      // Minecraft server - single metric import
      insertStmt = db.prepare(`
        INSERT INTO channel_analytics 
        (channel_slug, date, ${metricType})
        VALUES (?, ?, ?)
        ON CONFLICT(channel_slug, date) DO UPDATE SET
          ${metricType} = excluded.${metricType}
      `);
    }

    // Begin transaction
    const insertMany = db.transaction((entries) => {
      let imported = 0;
      
      // For both YouTube and Minecraft single metric imports
      for (const entry of entries) {
        try {
          insertStmt.run(
            channel_slug,
            entry.date,
            entry.value || 0
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
