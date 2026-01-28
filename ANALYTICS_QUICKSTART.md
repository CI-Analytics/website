# Live Analytics System - Schnellstart

## Installation

Die erforderlichen Pakete wurden bereits installiert:
- `chart.js` - Für Datenvisualisierung
- `better-sqlite3` - Für lokale Datenspeicherung

## Datenbankinitialisierung

Die Datenbank wird automatisch initialisiert beim ersten Start:
```bash
npm run dev
```

Dies erstellt die Datei `data/analytics.db` mit allen erforderlichen Tabellen.

## System-Architektur

```
src/
├── api/
│   ├── import.ts              # POST /api/import - Daten importieren
│   └── analytics/
│       └── [slug].ts          # GET /api/analytics/[slug] - Daten abrufen
├── lib/
│   ├── db.ts                  # Datenbank-Setup und -Verbindung
│   └── demoData.ts            # Demo-Daten für Tests
├── components/
│   └── charts/
│       ├── AnalyticsCharts.tsx # Grafiken-Komponente
│       └── DataImporter.tsx    # Import-Interface
├── pages/
│   ├── data/
│   │   └── [slug].astro       # Channel Analytics Pages
│   └── admin/
│       └── analytics.astro    # Admin Dashboard
└── layouts/
    └── Layout.astro
```

## Verwendung

### 1. Daten auf einer Channel-Seite hinzufügen

Gehe zu `/data/your-sound-effects` (oder einen anderen Channel):

1. Klicke auf "+ Import Data"
2. Wähle "Manual Entry" für einzelne Einträge
3. Fülle das Formular aus:
   - **Date**: Datum (z.B. 2025-01-28)
   - **Subscribers**: Abonnentenzahl (z.B. 151000)
   - **Total Views**: Gesamtaufrufe (z.B. 31000000)
   - **Total Videos**: Videoanzahl (z.B. 400)
   - **Avg Views per Video**: Durchschnitt (z.B. 77500)
4. Klicke "Import Record"

Oder nutze "CSV File" für Bulk-Import mit dieser Struktur:
```csv
date,subscribers,views,videos,avg_views_per_video
2025-01-20,150000,30500000,395,77215
2025-01-21,150500,31000000,400,77500
2025-01-22,151000,31000000,400,77500
```

### 2. Admin Dashboard aufrufen

Gehe zu `/admin/analytics` um alle Kanäle und ihre Daten zu sehen.

### 3. API direkt verwenden

**Daten importieren:**
```bash
curl -X POST http://localhost:3000/api/import \
  -H "Content-Type: application/json" \
  -d '{
    "channel_slug": "your-sound-effects",
    "data": [{
      "date": "2025-01-28",
      "subscribers": 151000,
      "views": 31000000,
      "videos": 400,
      "avg_views_per_video": 77500
    }]
  }'
```

**Daten abrufen:**
```bash
curl http://localhost:3000/api/analytics/your-sound-effects
```

## Demo-Daten importieren

Öffne die Browser-Konsole auf einer beliebigen Seite und führe aus:

```javascript
const demoData = {
  'your-sound-effects': [
    { date: '2025-01-20', subscribers: 150000, views: 30500000, videos: 395, avg_views_per_video: 77215 },
    { date: '2025-01-21', subscribers: 150500, views: 31000000, videos: 400, avg_views_per_video: 77500 },
  ],
  'tiimon': [
    { date: '2025-01-20', subscribers: 140000, views: 52000000, videos: 2950, avg_views_per_video: 17627 },
  ]
};

for (const [channel, data] of Object.entries(demoData)) {
  fetch('/api/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel_slug: channel, data })
  }).then(r => r.json()).then(d => console.log(channel, d));
}
```

## Datenbank-Verwaltung

### SQLite CLI mit der Datenbank arbeiten

```bash
# Datenbank öffnen
sqlite3 data/analytics.db

# Alle Daten für einen Kanal abrufen
SELECT * FROM channel_analytics WHERE channel_slug = 'your-sound-effects';

# Letzten Import-Eintrag sehen
SELECT * FROM import_logs ORDER BY import_date DESC LIMIT 5;

# Alle Kanäle mit Datenpunkten
SELECT channel_slug, COUNT(*) as data_points FROM channel_analytics GROUP BY channel_slug;
```

### Datenbankdatei

Die Datenbank wird unter `data/analytics.db` gespeichert. Diese Datei:
- Speichert alle importierten Daten persistent
- Wird nicht in Git verfolgt (in `.gitignore`)
- Kann bei Bedarf gelöscht und neu initialisiert werden

## Grafiken & Visualisierung

Die `AnalyticsCharts` Komponente zeigt automatisch:
- **Subscriber Growth**: Liniendiagramm des Abonnentenwachstums
- **Total Views**: Entwicklung der Gesamtaufrufe über Zeit
- **Avg Views per Video**: Durchschnittliche Aufrufe pro Video

Grafiken:
- Aktualisieren sich automatisch beim neuen Datenimport
- Zeigen max. 90 Tage Daten
- Sind responsive und angepasst ans Dark Theme

## Erweiterung & Anpassung

### Neue Metrik hinzufügen

1. **Datenbank-Schema aktualisieren** (`src/lib/db.ts`):
```typescript
ALTER TABLE channel_analytics ADD COLUMN new_metric REAL;
```

2. **API aktualisieren** (`src/api/import.ts`):
```typescript
insertStmt.run(..., entry.new_metric);
```

3. **Chart hinzufügen** (`src/components/charts/AnalyticsCharts.tsx`):
```typescript
const newMetricData = analytics.map(a => a.new_metric);
// ... neuen Chart erstellen
```

### Externe API verbinden

```typescript
// Beispiel: YouTube Analytics API
async function syncYoutubeData(channelId: string) {
  const data = await youtubeApi.getAnalytics(channelId);
  
  const response = await fetch('/api/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel_slug: 'my-channel',
      data: data.map(d => ({
        date: d.date,
        subscribers: d.subscribers,
        views: d.views,
        videos: d.videoCount,
        avg_views_per_video: d.views / d.videoCount
      }))
    })
  });
  
  return response.json();
}
```

## Fehlerbehebung

**Problem**: "Cannot find module better-sqlite3"
**Lösung**: `npm install better-sqlite3`

**Problem**: Datenbank-Fehler beim Import
**Lösung**: Stelle sicher, dass das `data/` Verzeichnis existiert und beschreibbar ist

**Problem**: Charts werden nicht angezeigt
**Lösung**: 
- Stelle sicher, dass Daten importiert wurden
- Überprüfe die Browser-Konsole auf Fehler
- Aktualisiere die Seite nach dem Import

## Support & Dokumentation

Siehe [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) für detaillierte technische Dokumentation.
