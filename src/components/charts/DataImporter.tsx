import React, { useState } from 'react';

interface YouTubeData {
  date: string;
  subscribers: number;
  views: number;
  videos: number;
  avg_views_per_video: number;
}

interface MinecraftData {
  date: string;
  daily_user: number;
  daily_peak_online: number;
  weekly_user: number;
  alltime_user: number;
  daily_sessions: number;
}

type ImportData = YouTubeData | MinecraftData;

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
  const [importMethod, setImportMethod] = useState<'manual' | 'file'>('manual');

  // YouTube form state
  const [youtubeFormData, setYoutubeFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subscribers: '',
    views: '',
    videos: '',
    avg_views_per_video: ''
  });

  // Minecraft form state
  const [minecraftFormData, setMinecraftFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    daily_user: '',
    daily_peak_online: '',
    weekly_user: '',
    alltime_user: '',
    daily_sessions: ''
  });

  const handleYoutubeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setYoutubeFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMinecraftInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMinecraftFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const lines = text.trim().split('\n');

      let data: ImportData[];

      if (serverType === 'youtube') {
        data = lines
          .slice(1)
          .map(line => {
            const [date, subscribers, views, videos, avg_views_per_video] = line.split(',');
            return {
              date: date.trim(),
              subscribers: parseInt(subscribers.trim()),
              views: parseInt(views.trim()),
              videos: parseInt(videos.trim()),
              avg_views_per_video: parseFloat(avg_views_per_video.trim())
            } as YouTubeData;
          });
      } else {
        data = lines
          .slice(1)
          .map(line => {
            const [date, daily_user, daily_peak_online, weekly_user, alltime_user, daily_sessions] = line.split(',');
            return {
              date: date.trim(),
              daily_user: parseInt(daily_user.trim()),
              daily_peak_online: parseInt(daily_peak_online.trim()),
              weekly_user: parseInt(weekly_user.trim()),
              alltime_user: parseInt(alltime_user.trim()),
              daily_sessions: parseInt(daily_sessions.trim())
            } as MinecraftData;
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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let data: ImportData[];

    if (serverType === 'youtube') {
      data = [{
        date: youtubeFormData.date,
        subscribers: parseInt(youtubeFormData.subscribers),
        views: parseInt(youtubeFormData.views),
        videos: parseInt(youtubeFormData.videos),
        avg_views_per_video: parseFloat(youtubeFormData.avg_views_per_video)
      } as YouTubeData];
    } else {
      data = [{
        date: minecraftFormData.date,
        daily_user: parseInt(minecraftFormData.daily_user),
        daily_peak_online: parseInt(minecraftFormData.daily_peak_online),
        weekly_user: parseInt(minecraftFormData.weekly_user),
        alltime_user: parseInt(minecraftFormData.alltime_user),
        daily_sessions: parseInt(minecraftFormData.daily_sessions)
      } as MinecraftData];
    }

    await submitImport(data);
  };

  const submitImport = async (data: ImportData[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_slug: slug, data })
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

      // Reset form
      if (serverType === 'youtube') {
        setYoutubeFormData({
          date: new Date().toISOString().split('T')[0],
          subscribers: '',
          views: '',
          videos: '',
          avg_views_per_video: ''
        });
      } else {
        setMinecraftFormData({
          date: new Date().toISOString().split('T')[0],
          daily_user: '',
          daily_peak_online: '',
          weekly_user: '',
          alltime_user: '',
          daily_sessions: ''
        });
      }

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
          <h3>Import Channel Analytics Data</h3>

          <div className="method-tabs">
            <button
              className={`tab ${importMethod === 'manual' ? 'active' : ''}`}
              onClick={() => setImportMethod('manual')}
            >
              Manual Entry
            </button>
            <button
              className={`tab ${importMethod === 'file' ? 'active' : ''}`}
              onClick={() => setImportMethod('file')}
            >
              CSV File
            </button>
          </div>

          {importMethod === 'manual' && (
            <form onSubmit={handleManualSubmit} className="import-form">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={serverType === 'youtube' ? youtubeFormData.date : minecraftFormData.date}
                  onChange={serverType === 'youtube' ? handleYoutubeInputChange : handleMinecraftInputChange}
                  required
                />
              </div>

              {serverType === 'youtube' ? (
                <>
                  <div className="form-group">
                    <label>Subscribers</label>
                    <input
                      type="number"
                      name="subscribers"
                      value={youtubeFormData.subscribers}
                      onChange={handleYoutubeInputChange}
                      placeholder="e.g., 151000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Views</label>
                    <input
                      type="number"
                      name="views"
                      value={youtubeFormData.views}
                      onChange={handleYoutubeInputChange}
                      placeholder="e.g., 31000000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Videos</label>
                    <input
                      type="number"
                      name="videos"
                      value={youtubeFormData.videos}
                      onChange={handleYoutubeInputChange}
                      placeholder="e.g., 400"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Avg Views per Video</label>
                    <input
                      type="number"
                      step="0.01"
                      name="avg_views_per_video"
                      value={youtubeFormData.avg_views_per_video}
                      onChange={handleYoutubeInputChange}
                      placeholder="e.g., 77500"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Daily Users</label>
                    <input
                      type="number"
                      name="daily_user"
                      value={minecraftFormData.daily_user}
                      onChange={handleMinecraftInputChange}
                      placeholder="e.g., 1250"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Daily Peak Online</label>
                    <input
                      type="number"
                      name="daily_peak_online"
                      value={minecraftFormData.daily_peak_online}
                      onChange={handleMinecraftInputChange}
                      placeholder="e.g., 320"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Weekly Users</label>
                    <input
                      type="number"
                      name="weekly_user"
                      value={minecraftFormData.weekly_user}
                      onChange={handleMinecraftInputChange}
                      placeholder="e.g., 4500"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Alltime Users</label>
                    <input
                      type="number"
                      name="alltime_user"
                      value={minecraftFormData.alltime_user}
                      onChange={handleMinecraftInputChange}
                      placeholder="e.g., 50000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Daily Sessions</label>
                    <input
                      type="number"
                      name="daily_sessions"
                      value={minecraftFormData.daily_sessions}
                      onChange={handleMinecraftInputChange}
                      placeholder="e.g., 8200"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Importing...' : 'Import Record'}
              </button>
            </form>
          )}

          {importMethod === 'file' && (
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
                {serverType === 'youtube'
                  ? 'CSV Format: date,subscribers,views,videos,avg_views_per_video'
                  : 'CSV Format: date,daily_user,daily_peak_online,weekly_user,alltime_user,daily_sessions'
                }
              </p>
            </div>
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

        .method-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tab {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab.active {
          background: rgba(0, 212, 255, 0.15);
          border-color: rgba(0, 212, 255, 0.4);
          color: rgba(0, 212, 255, 1);
        }

        .import-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          padding: 0.6rem;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: rgba(0, 212, 255, 0.4);
          background: rgba(0, 212, 255, 0.05);
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

        .submit-btn {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #00D4FF, #0066FF);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
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
