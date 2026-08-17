import React, { useState } from 'react';
import { 
  FileText, 
  Link2, 
  Mic, 
  Music, 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Clock, 
  ExternalLink,
  Download,
  Loader2
} from 'lucide-react';
import MediaPreview from './MediaPreview';
import api from '../../api';

export default function EntryCard({ entry, onEdit, onDelete, onTagClick }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIcon = () => {
    switch (entry.type) {
      case 'link':
        return <Link2 className="h-4 w-4 text-slate-500" />;
      case 'voice':
        return <Mic className="h-4 w-4 text-emerald-600" />;
      case 'audio':
        return <Music className="h-4 w-4 text-blue-600" />;
      case 'video':
        return <Video className="h-4 w-4 text-indigo-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if (['voice', 'audio', 'video', 'image'].includes(entry.type) && entry.fileKey) {
        // Fetch presigned view URL from backend
        const res = await api.get(`/entries/${entry._id}/view-url`);
        const mediaUrl = res.data.url;

        // Fetch to bypass browser opening media in a new tab
        const response = await fetch(mediaUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Try to get extension from URL safely
        const parts = mediaUrl.split('/');
        const lastPart = parts[parts.length - 1] || 'file';
        const extensionMatch = lastPart.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
        const extension = extensionMatch ? extensionMatch[1] : (entry.type === 'image' ? 'png' : 'mp4');
        
        const filename = entry.title 
          ? `${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}` 
          : `${entry.type}_${Date.now()}.${extension}`;
          
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (entry.type === 'text' || entry.type === 'link') {
        const textToDownload = entry.type === 'link' ? `Link: ${entry.textContent}` : entry.textContent;
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = entry.title 
          ? `${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt` 
          : `memory_${Date.now()}.txt`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the file. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group bg-white border border-slate-200/80 rounded-xl p-4 hover:border-slate-300 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 text-slate-400 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            {entry.title ? (
              <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                {entry.title}
              </h4>
            ) : (
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block truncate">
                {entry.type} entry
              </span>
            )}
          </div>
        </div>

        {/* Action icons & Time */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock className="h-3 w-3 text-slate-300" />
            <span>{formatTime(entry.entryDate)}</span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-200">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`rounded-lg p-1 transition duration-150 cursor-pointer ${
                isDownloading 
                  ? 'text-accent bg-accent/10 cursor-wait' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
              title={isDownloading ? "Downloading..." : "Download Entry"}
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </button>
            
            {onEdit && (
              <button
                onClick={onEdit}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition duration-150 cursor-pointer"
                title="Edit Entry"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition duration-150 cursor-pointer"
                title="Delete Entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="space-y-3">
        {entry.type === 'text' && (
          <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed select-text break-words">
            {entry.textContent}
          </p>
        )}

        {entry.type === 'link' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed break-all">
              {entry.textContent}
            </p>
            <a
              href={entry.textContent}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-dark transition-colors break-all"
            >
              <span>Visit Link</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Media Preview Component */}
        {['voice', 'audio', 'video', 'image'].includes(entry.type) && (
          <MediaPreview entry={entry} />
        )}
      </div>

      {/* Tags Footer */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
          {entry.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick && onTagClick(tag)}
              className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
