# Live Analytics System - Dokumentation

## Übersicht

Das System ermöglicht es, YouTube-Kanal-Daten zu importieren, zu speichern und zu visualisieren. Die Daten werden in einer SQLite-Datenbank gespeichert und können über ein Webinterface verwaltet werden.

## Features

### 1. **Datenimport**
- Manuelle Eingabe einzelner Datensätze
- CSV-Dateiupload für Bulk-Import
- Automatische Duplikatvermeidung (upsert-Logik)

### 2. **Datenspeicherung**
- SQLite-Datenbank (`data/analytics.db`)
- Strukturierte Tabellen für Analytics, Kanäle und Import-Logs
- Automatische Indizierung für schnelle Abfragen

### 3. **Visualisierung**
- **Subscriber Growth Chart**: Zeigt Abonnentenwachstum über Zeit
- **Total Views Chart**: Visualisiert Gesamtaufrufe
- **Avg Views per Video Chart**: Durchschnittliche Aufrufe pro Video

### 4. **API-Endpunkte**

#### `POST /api/import`
Importiere Daten in die Datenbank.

**Request:**
```json
{
  "channel_slug": "your-sound-effects",
  "data": [
    {
      "date": "2025-01-28",
      "subscribers": 151000,
      "views": 31000000,
      "videos": 400,
      "avg_views_per_video": 77500
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "channel_slug": "your-sound-effects",
  "recordsImported": 1,
  "message": "Successfully imported 1 records"
}
```

#### `GET /api/analytics/[slug]`
Hole Analytics-Daten für einen Kanal.

**Response:**
```json
{
  "success": true,
  "channel": "your-sound-effects",
  "analytics": [
    {
      "channel_slug": "your-sound-effects",
      "date": "2025-01-28",
      "subscribers": 151000,
      "views": 31000000,
      "videos": 400,
      "avg_views_per_video": 77500
    }
  ],
  "imports": [...],
  "summary": {
    "total_records": 10,
    "last_update": "2025-01-28",
    "avg_subscribers": 150500,
    "max_subscribers": 151000,
    "avg_views": 30500000,
    "max_views": 31000000
  }
}
```

## Datenbank-Schema

### `channel_analytics`
```sql
- id: INTEGER PRIMARY KEY
- channel_slug: TEXT (FK to channels.slug)
- date: DATE
- subscribers: INTEGER
- views: INTEGER
- videos: INTEGER
- avg_views_per_video: REAL
- growth_rate: REAL (optional)
- engagement_rate: REAL (optional)
- created_at: DATETIME
```

### `channels`
```sql
- slug: TEXT PRIMARY KEY
- name: TEXT
- description: TEXT
- image: TEXT
- youtube_url: TEXT
- status: TEXT ('active' | 'inactive')
- created_at: DATETIME
```

### `import_logs`
```sql
- id: INTEGER PRIMARY KEY
- channel_slug: TEXT (FK)
- import_date: DATETIME
- records_imported: INTEGER
- api_source: TEXT
- status: TEXT ('success' | 'error')
- error_message: TEXT
```

## CSV-Format für Datei-Upload

```
date,subscribers,views,videos,avg_views_per_video
2025-01-20,150000,30500000,395,77215
2025-01-21,150500,31000000,400,77500
2025-01-22,151000,31000000,400,77500
```

## Verwendung auf Data Pages

Die neuen Komponenten werden automatisch auf jeder `/data/[slug]` Seite angezeigt:

1. **DataImporter Component**: Import-Button zum Hinzufügen neuer Daten
2. **AnalyticsCharts Component**: Visualisierung der importierten Daten

## Workflow

### Daten hinzufügen:
1. Navigiere zu `/data/[channel-slug]`
2. Klicke auf "+ Import Data"
3. Wähle zwischen "Manual Entry" oder "CSV File"
4. Füge Daten ein und klicke "Import Record"
5. Daten werden in der Datenbank gespeichert
6. Graphen aktualisieren sich automatisch

### Daten anzeigen:
- Charts zeigen die letzten 90 Tage von Daten
- Alle Zeiträume werden chronologisch geordnet angezeigt
- Live-Updates wenn neue Daten importiert werden

## API-Integrationen

Das System ist vorbereitet für externe API-Integrationen:

```typescript
// Beispiel: YouTube Analytics API
const youtubeData = await fetchYoutubeAnalytics(channelId);
const importResponse = await fetch('/api/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channel_slug: 'your-channel',
    data: youtubeData.map(d => ({
      date: d.date,
      subscribers: d.subscribers,
      views: d.views,
      videos: d.videoCount,
      avg_views_per_video: d.views / d.videoCount
    }))
  })
});
```

## Performance & Skalierbarkeit

- Datenbank-Indizes für schnelle Abfragen
- Automatische Pagination (90-Tage-Limit)
- Bulk-Insert mit Transaktionen
- Duplikat-Handling mit UNIQUE constraints

## Datenschutz & Verwaltung

- Datenbank-Datei ist lokal gespeichert
- Keine externen Cloud-Services erforderlich
- Import-Logs für Audit-Trail
- Fehlerbehandlung und Validierung

## Zukünftige Erweiterungen

- Admin-Dashboard für alle Kanäle
- Export zu CSV/PDF
- Automatische API-Synchronisierung
- Vergleichende Analysen zwischen Kanälen
- Prognosen und Trends
