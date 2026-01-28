// Demo data import script
// Verwende diesen Code, um Demo-Daten zu importieren

export const demoData = {
  channels: [
    { slug: 'your-sound-effects', name: 'Your Sound Effects' },
    { slug: 'tiimon', name: 'Tiimon' },
    { slug: 'demelus-shorts', name: 'Demelus Shorts' }
  ],
  analyticsData: {
    'your-sound-effects': [
      { date: '2025-01-20', subscribers: 150000, views: 30500000, videos: 395, avg_views_per_video: 77215 },
      { date: '2025-01-21', subscribers: 150500, views: 31000000, videos: 400, avg_views_per_video: 77500 },
      { date: '2025-01-22', subscribers: 151000, views: 31000000, videos: 400, avg_views_per_video: 77500 },
      { date: '2025-01-23', subscribers: 151200, views: 31500000, videos: 402, avg_views_per_video: 78407 },
      { date: '2025-01-24', subscribers: 151500, views: 32000000, videos: 405, avg_views_per_video: 79012 },
    ],
    'tiimon': [
      { date: '2025-01-20', subscribers: 140000, views: 52000000, videos: 2950, avg_views_per_video: 17627 },
      { date: '2025-01-21', subscribers: 140500, views: 52500000, videos: 2975, avg_views_per_video: 17647 },
      { date: '2025-01-22', subscribers: 141000, views: 53000000, videos: 3000, avg_views_per_video: 17666 },
    ],
    'demelus-shorts': [
      { date: '2025-01-20', subscribers: 102000, views: 41000000, videos: 95, avg_views_per_video: 431578 },
      { date: '2025-01-21', subscribers: 102500, views: 42000000, videos: 98, avg_views_per_video: 428571 },
      { date: '2025-01-22', subscribers: 103000, views: 42500000, videos: 100, avg_views_per_video: 425000 },
    ]
  }
};

/**
 * Beispiel: Wie man Demo-Daten importiert
 * 
 * Führe diesen Code in der Browser-Konsole aus oder nutze ihn in einem Script:
 * 
 * for (const [channelSlug, data] of Object.entries(demoData.analyticsData)) {
 *   fetch('/api/import', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ channel_slug: channelSlug, data })
 *   })
 *   .then(r => r.json())
 *   .then(result => console.log(`Imported for ${channelSlug}:`, result))
 *   .catch(err => console.error(`Error importing ${channelSlug}:`, err));
 * }
 */
