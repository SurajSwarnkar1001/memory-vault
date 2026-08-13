import React, { useState, useEffect } from 'react';

const COLORS = [
  { name: 'Green', value: '#1b7a43' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Charcoal', value: '#334155' },
  { name: 'Terracotta', value: '#ea580c' },
  { name: 'Plum', value: '#7c3aed' },
  { name: 'Rose', value: '#db2777' },
];

export default function ProjectForm({ project, onSubmit, onCancel, submitLabel = 'Save Project' }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setColor(project.color || COLORS[0].value);
    } else {
      setName('');
      setDescription('');
      setColor(COLORS[0].value);
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name, description, color });
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="proj-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Project Name
        </label>
        <input
          id="proj-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transition duration-150"
          placeholder="e.g. My Side Business"
        />
      </div>

      <div>
        <label htmlFor="proj-desc" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Description (Optional)
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transition duration-150 resize-none"
          placeholder="Brief overview of the project..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Accent Color
        </label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              style={{ backgroundColor: c.value }}
              className={`h-7 w-7 rounded-full transition-all duration-150 cursor-pointer ${
                color === c.value
                  ? 'ring-2 ring-slate-400 ring-offset-2 scale-110'
                  : 'hover:scale-105'
              }`}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 hover:text-slate-800 transition duration-150 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-dark transition duration-150 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
