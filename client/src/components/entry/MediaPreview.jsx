import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, AlertCircle, FileText, Download } from 'lucide-react';

export default function MediaPreview({ entry }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoomImage, setZoomImage] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchViewUrl = async () => {
      try {
        const response = await api.get(`/entries/${entry._id}/view-url`);
        if (isMounted) {
          setUrl(response.data.url);
          setError('');
        }
      } catch (err) {
        console.error('Error fetching view URL:', err);
        if (isMounted) {
          setError('Failed to load media link');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (entry.fileKey) {
      fetchViewUrl();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [entry._id, entry.fileKey]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-slate-50 rounded-xl text-slate-400 text-xs border border-slate-100">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
        <span>Generating secure viewing link...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!url) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Rendering Images */}
      {entry.type === 'image' && (
        <div>
          <img
            src={url}
            alt={entry.fileName || 'Uploaded image'}
            onClick={() => setZoomImage(true)}
            className="max-h-64 sm:max-h-80 w-auto rounded-xl object-contain border border-slate-200/60 hover:opacity-95 transition duration-150 cursor-zoom-in"
          />

          {/* Expanded Modal Zoom */}
          {zoomImage && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 transition-opacity duration-300"
              onClick={() => setZoomImage(false)}
            >
              <img
                src={url}
                alt={entry.fileName}
                className="max-h-full max-w-full rounded-lg object-contain scale-100 animate-in zoom-in-95 duration-200"
              />
              <button 
                className="absolute top-4 right-4 text-white bg-slate-800/80 hover:bg-slate-700 hover:scale-105 p-2 rounded-full cursor-pointer transition text-xs font-semibold"
                onClick={() => setZoomImage(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rendering Audio / Voice */}
      {['audio', 'voice'].includes(entry.type) && (
        <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 px-1">
            <span>{entry.type === 'voice' ? 'Voice Memo' : 'Audio note'}</span>
            <span>{entry.fileName}</span>
          </div>
          <audio src={url} controls className="w-full h-8" />
        </div>
      )}

      {/* Rendering Videos */}
      {entry.type === 'video' && (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
          <video
            src={url}
            controls
            className="w-full max-h-[360px] object-contain"
          />
        </div>
      )}

    </div>
  );
}
