import React from 'react';
import { Folder, Trash2, Edit3, Calendar, FileText } from 'lucide-react';

export default function ProjectCard({ project, onClick, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      className="group relative bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between min-h-[160px] cursor-pointer"
      onClick={onClick}
    >
      <div>
        {/* Header Indicator */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span 
              className="h-2.5 w-2.5 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            <h3 className="font-semibold text-slate-800 group-hover:text-accent transition-colors duration-150 text-base line-clamp-1">
              {project.name}
            </h3>
          </div>
          
          {/* Action buttons (only show edit/delete triggers on card hover) */}
          <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition duration-150 cursor-pointer"
              title="Edit Project"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition duration-150 cursor-pointer"
              title="Delete Project"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Metadata Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-slate-300" />
          <span>{project.entryCount} {project.entryCount === 1 ? 'entry' : 'entries'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          <span>{formatDate(project.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}
