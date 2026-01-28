import React, { useState } from 'react';

interface YouTubeDailyData {
  date: string;
  value: number;
}

interface MinecraftData {
  date: string;
  daily_user: number;
  daily_peak_online: number;
  weekly_user: number;
  alltime_user: number;
  daily_sessions: number;
}

type ImportData = YouTubeDailyData | MinecraftData;

interface DataImporterProps {
  slug: string;
  dataType?: string;
  onImportSuccess?: () => void;
}

// Detect server type from slug or dataType prop
function getServerType(slug: string, dataType?: string): 'youtube' | 'minecraft' {
  if (dataType) {
    return dataType.toLowerCase().includes('minecraft') ? 'minecraft' : 'youtube';
  }
  const minecraftSlugs = ['msb', 'ycb', 'boom'];
  return minecraftSlugs.includes(slug) ? 'minecraft' : 'youtube';
}

export default function DataImporter({ slug, dataType, onImportSuccess }: DataImporterProps) {
  const serverType = getServerType(slug, dataType);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importType, setImportType] = useState<'daily_views' | 'daily_subscribers' | 'daily_uploads' | 'daily_user' | 'daily_peak_online' | 'weekly_user' | 'alltime_user' | 'daily_sessions'>('daily_views');

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const lines = text.trim().split('\n');

      let data: YouTubeDailyData[] | MinecraftData[];

      if (serverType === 'youtube') {
        data = lines
          .slice(1)
          .map(line => {
            const [date, value] = line.split(',');
            return {
              date: date.trim(),
              value: parseInt(value.trim())
            } as YouTubeDailyData;
          });
      } else {
        // Minecraft: single metric per import
        data = lines
          .slice(1)
          .map(line => {
            const [date, value] = line.split(',');
            return {
              date: date.trim(),
              [importType]: parseInt(value.trim())
            } as any as MinecraftData;
          });
      }

      await submitImport(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to parse file'
      });
    } finally {
      setLoading(false);
    }
  };

  const submitImport = async (data: YouTubeDailyData[] | MinecraftData[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          channel_slug: slug, 
          data,
          metricType: importType
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage({ type: 'error', text: result.error || 'Import failed' });
        return;
      }

      setMessage({
        type: 'success',
        text: `✓ Successfully imported ${result.recordsImported} records`
      });

      if (onImportSuccess) onImportSuccess();

      setTimeout(() => {
        setMessage(null);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import data'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="data-importer">
      <button
        className="import-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        {isOpen ? '✕ Close' : '➕ Import Data'}
      </button>

      {isOpen && (
        <div className="import-panel">
          <h3>Import Analytics Data</h3>

          {serverType === 'youtube' ? (
            <>
              <div className="importer-tabs">
                <button
                  className={`importer-tab ${importType === 'daily_views' ? 'active' : ''}`}
                  onClick={() => setImportType('daily_views')}
                >
                  Daily Views
                </button>
                <button
                  className={`importer-tab ${importType === 'daily_subscribers' ? 'active' : ''}`}
                  onClick={() => setImportType('daily_subscribers')}
                >
                  Daily Subscribers
                </button>
                <button
                  className={`importer-tab ${importType === 'daily_uploads' ? 'active' : ''}`}
                  onClick={() => setImportType('daily_uploads')}
                >
                  Daily Uploads
                </button>
              </div>

              <div className="file-upload">
                <label htmlFor="csv-file">
                  Select CSV File
                </label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileImport}
                  disabled={loading}
                />
                <p className="help-text">
                  CSV Format: date,value
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="importer-tabs">
                <button
                  className={`importer-tab ${importType === 'daily_user' ? 'active' : ''}`}
                  onClick={() => setImportType('daily_user')}
                >
                  Daily Users
                </button>
                <button
                  className={`importer-tab ${importType === 'daily_peak_online' ? 'active' : ''}`}
                  onClick={() => setImportType('daily_peak_online')}
                >
                  Peak Online
                </button>
                <button
                  className={`importer-tab ${importType === 'weekly_user' ? 'active' : ''}`}
                  onClick={() => setImportType('weekly_user')}
                >
                  Weekly Users
                </button>
                <button
                  className={`importer-tab ${importType === 'alltime_user' ? 'active' : ''}`}
                  onClick={() => setImportType('alltime_user')}
                >
                  All-time Users
                </button>
                <button
                  className={`importer-tab ${importType === 'daily_sessions' ? 'active' : ''}`}
                  onClick={() => setImportType('daily_sessions')}
                >
                  Daily Sessions
                </button>
              </div>

              <div className="file-upload">
                <label htmlFor="csv-file">
                  Select CSV File
                </label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileImport}
                  disabled={loading}
                />
                <p className="help-text">
                  CSV Format: date,value
                </p>
              </div>
            </>
          )}

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      )}

      <style>{`
        .data-importer {
          margin-bottom: 2rem;
        }

        .import-btn {
          width: 100%;
          background: linear-gradient(135deg, #00D4FF, #0066FF);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .import-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
        }

        .import-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .import-panel {
          background: linear-gradient(180deg, rgba(16, 23, 48, 0.95), rgba(9, 12, 30, 0.95));
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 12px;
          padding: 2rem;
          margin-top: 1rem;
        }

        .import-panel h3 {
          margin-top: 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .importer-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .importer-tab {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .importer-tab.active {
          background: rgba(0, 212, 255, 0.15);
          border-color: rgba(0, 212, 255, 0.4);
          color: rgba(0, 212, 255, 1);
        }

        .importer-tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .file-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          border: 2px dashed rgba(0, 212, 255, 0.3);
          border-radius: 8px;
          gap: 1rem;
        }

        .file-upload label {
          color: rgba(0, 212, 255, 0.9);
          cursor: pointer;
          font-weight: 600;
        }

        .file-upload input {
          cursor: pointer;
        }

        .help-text {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          margin: 0;
          font-family: monospace;
        }

        .message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 6px;
          font-weight: 600;
        }

        .message.success {
          background: rgba(0, 255, 136, 0.1);
          color: rgba(0, 255, 136, 0.9);
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .message.error {
          background: rgba(255, 100, 100, 0.1);
          color: rgba(255, 150, 150, 0.9);
          border: 1px solid rgba(255, 100, 100, 0.3);
        }
      `}</style>
    </div>
  );
}
