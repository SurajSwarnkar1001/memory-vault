import React, { useState, useEffect, useCallback } from 'react';
import useEntries from '../hooks/useEntries';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import EntryComposer from '../components/entry/EntryComposer';
import EntryCard from '../components/entry/EntryCard';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import InviteModal from '../components/project/InviteModal';
import { useAuth } from '../context/AuthContext';
import { groupEntriesByDate } from '../utils/dateGrouping';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar, 
  X, 
  Loader2, 
  Info,
  SlidersHorizontal,
  UserPlus
} from 'lucide-react';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'text', label: 'Notes' },
  { value: 'link', label: 'Links' },
  { value: 'voice', label: 'Voice Memos' },
  { value: 'audio', label: 'Audio files' },
  { value: 'video', label: 'Videos' },
  { value: 'image', label: 'Images' }
];

export default function ProjectPage({ projectId, onNavigate }) {
  const {
    entries,
    loading,
    error,
    fetchEntries,
    createTextOrLinkEntry,
    uploadFile,
    updateEntry,
    deleteEntry,
  } = useEntries();

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { user } = useAuth();

  // Filter States
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [tag, setTag] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Edit / Delete states
  const [editingEntry, setEditingEntry] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTextContent, setEditTextContent] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const [editEntryDate, setEditEntryDate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [entryToDelete, setEntryToDelete] = useState(null);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setProjectLoading(true);
      try {
        const response = await api.get(`/projects`);
        const currentProj = response.data.find(p => p._id === projectId);
        setProject(currentProj);
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  // Fetch entries based on current filter values
  const loadEntries = useCallback(() => {
    const fromStr = fromDate ? fromDate.toLocaleDateString('en-CA') : '';
    const toStr = toDate ? toDate.toLocaleDateString('en-CA') : '';
    fetchEntries(projectId, { search, type, tag, from: fromStr, to: toStr });
  }, [projectId, fetchEntries, search, type, tag, fromDate, toDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Handle entry creation
  const handleCreateEntry = async (data) => {
    if (['text', 'link'].includes(data.type)) {
      return await createTextOrLinkEntry(projectId, data);
    } else {
      // It's a file upload (voice, audio, video, image)
      const { file, onProgress, ...entryFields } = data;
      return await uploadFile(projectId, file, entryFields, onProgress);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setEditTitle(entry.title || '');
    setEditTextContent(entry.textContent || '');
    setEditTagsInput(entry.tags ? entry.tags.join(', ') : '');
    
    const localDate = new Date(entry.entryDate);
    setEditEntryDate(localDate);
    
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingEntry) return;

    const tags = editTagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const data = {
      title: editTitle.trim(),
      textContent: editTextContent.trim(),
      tags,
      entryDate: editEntryDate ? editEntryDate.toISOString() : new Date().toISOString()
    };

    const result = await updateEntry(editingEntry._id, data);
    if (result.success) {
      setIsEditModalOpen(false);
      setEditingEntry(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteEntryConfirm = async () => {
    if (entryToDelete) {
      const result = await deleteEntry(entryToDelete._id);
      if (result.success) {
        setEntryToDelete(null);
      }
    }
  };

  // Quick reset filters
  const resetFilters = () => {
    setSearch('');
    setType('');
    setTag('');
    setFromDate(null);
    setToDate(null);
  };

  const hasActiveFilters = search || type || tag || fromDate || toDate;

  // Grouped Timeline
  const groupedEntries = groupEntriesByDate(entries);
  const isOwner = user && project && (user.id === project.userId || user._id === project.userId);

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Desktop left sidebar */}
      <Sidebar currentPath={`/project/${projectId}`} onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Navbar onNavigate={onNavigate} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Back and Project Header */}
        <div className="mb-6 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="rounded-lg p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition duration-150 cursor-pointer shrink-0"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {projectLoading ? (
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : project ? (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="h-3 w-3 rounded-full shrink-0" 
                    style={{ backgroundColor: project.color }}
                  />
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                    {project.name}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {project.description || 'No description provided.'}
                </p>
              </div>
            ) : (
              <span className="text-sm text-slate-500">Project not found</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Members / Collaborators button for everyone */}
            {project && user && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {isOwner ? 'Share' : 'Members'}
                </span>
              </button>
            )}

            {/* Quick Filter toggle */}
            <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 border rounded-lg text-xs font-semibold cursor-pointer transition shrink-0 ${
              showFilters || hasActiveFilters
                ? 'bg-accent-light border-accent-light text-accent'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 h-4 w-4 bg-accent text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                !
              </span>
            )}
          </button>
          </div>
        </div>

        {/* Filter Controls Panel */}
        {(showFilters || hasActiveFilters) && (
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 mb-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Search & Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Text Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entries..."
                  className="block w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Type selector */}
              <div className="w-full">
                <Select
                  options={typeOptions}
                  value={typeOptions.find(opt => opt.value === type) || typeOptions[0]}
                  onChange={(selected) => setType(selected.value)}
                  isSearchable={false}
                  unstyled
                  classNames={{
                    control: (state) =>
                      `w-full rounded-lg border ${state.isFocused ? 'border-accent' : 'border-slate-200'} bg-white px-3 py-[3px] text-xs text-slate-700 transition cursor-pointer min-h-[34px] flex items-center`,
                    menu: () =>
                      'mt-1 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden text-xs z-50',
                    option: (state) =>
                      `px-3 py-2 cursor-pointer transition-colors ${state.isSelected ? 'bg-accent text-white font-semibold' : state.isFocused ? 'bg-slate-50 text-slate-900' : 'text-slate-700'}`,
                    singleValue: () => 'text-slate-700 leading-none cursor-pointer',
                    dropdownIndicator: (state) => `text-slate-400 transition-transform ${state.selectProps.menuIsOpen ? 'rotate-180' : ''} p-1 cursor-pointer`,
                    indicatorSeparator: () => 'hidden',
                  }}
                />
              </div>

              {/* Tag Search */}
              <div className="relative">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Filter by tag (e.g. todo)"
                  className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Date pickers placeholder/container */}
              <div className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  placeholderText="From Date"
                  className="block w-full min-w-0 max-w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-accent cursor-pointer"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  wrapperClassName="w-full"
                />
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  placeholderText="To Date"
                  className="block w-full min-w-0 max-w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-accent cursor-pointer"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Entry Composer */}
        <div className="mb-8">
          <EntryComposer onSubmit={handleCreateEntry} />
        </div>

        {/* Timeline Content */}
        {loading ? (
          <div className="space-y-6 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-12 sm:w-16 flex-shrink-0 pt-1">
                  <Skeleton className="h-4 w-10 sm:w-12 ml-auto" />
                </div>
                <div className="flex-1 bg-white border border-slate-200/60 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          /* Empty Timeline */
          <div className="border border-slate-200/60 rounded-xl bg-white p-12 text-center max-w-sm mx-auto mt-6">
            <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Info className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-xs font-semibold text-slate-800">
              {hasActiveFilters ? 'No matching entries' : 'Timeline is empty'}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed max-w-[220px] mx-auto">
              {hasActiveFilters 
                ? 'Try clearing some search keywords or date ranges to find what you are looking for.' 
                : 'Write your first note, paste a link, or record voice notes above to start adding to your timeline.'}
            </p>
          </div>
        ) : (
          /* Date-wise Timeline */
          <div className="space-y-8 relative before:absolute before:left-3.5 sm:before:left-4 before:top-4 before:bottom-4 before:w-[1px] before:bg-slate-200/70">
            {groupedEntries.map((group) => (
              <div key={group.dateHeader} className="space-y-4 relative">
                {/* Date Header Indicator */}
                <div className="flex items-center gap-3 sticky top-14 bg-bg-light/95 backdrop-blur-xs py-2 z-10">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10 shrink-0 font-medium text-slate-500 text-[9px] sm:text-[10px] shadow-2xs">
                    D
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    {group.dateHeader}
                  </h3>
                </div>

                {/* Cards for this date */}
                <div className="ml-7 sm:ml-10 space-y-4">
                  {group.entries.map((entry) => (
                    <EntryCard
                      key={entry._id}
                      entry={entry}
                      onEdit={() => handleOpenEdit(entry)}
                      onDelete={() => setEntryToDelete(entry)}
                      onTagClick={(t) => {
                        setTag(t);
                        setShowFilters(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Entry Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEntry(null);
        }}
        title="Edit Entry"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 sm:text-xs focus:outline-none focus:border-accent"
              placeholder="Title (Optional)"
            />
          </div>

          {editingEntry && ['text', 'link'].includes(editingEntry.type) && (
            <div>
              <label htmlFor="edit-text" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Content
              </label>
              <textarea
                id="edit-text"
                value={editTextContent}
                onChange={(e) => setEditTextContent(e.target.value)}
                rows={4}
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 sm:text-xs focus:outline-none focus:border-accent resize-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-tags" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Tags
              </label>
              <input
                id="edit-tags"
                type="text"
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent"
                placeholder="tags (comma-separated, e.g. review, deploy)"
              />
            </div>

            <div>
              <label htmlFor="edit-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Entry Date
              </label>
              <DatePicker
                id="edit-date"
                selected={editEntryDate}
                onChange={(date) => setEditEntryDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="yyyy-MM-dd HH:mm"
                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-accent cursor-pointer"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {!isOwner && (
              <span className="text-xs text-red-500 font-semibold mr-auto">
                Only the owner can edit entries.
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingEntry(null);
              }}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 hover:text-slate-800 transition duration-150 cursor-pointer"
            >
              {isOwner ? 'Cancel' : 'Close'}
            </button>
            {isOwner && (
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-dark transition duration-150 cursor-pointer font-medium"
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Entry Modal */}
      <Modal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        title="Delete Entry"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {isOwner 
              ? `Are you sure you want to delete this entry? This will permanently remove it from your timeline.${entryToDelete?.fileKey ? ' The corresponding file in Cloudflare R2 will also be deleted.' : ''} This action cannot be undone.`
              : 'You do not have permission to delete entries. Only the project owner can perform this action.'}
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setEntryToDelete(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 hover:text-slate-800 transition duration-150 cursor-pointer"
            >
              {isOwner ? 'Cancel' : 'Close'}
            </button>
            {isOwner && (
              <button
                onClick={handleDeleteEntryConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition duration-150 cursor-pointer font-medium"
              >
                Delete Entry
              </button>
            )}
          </div>
        </div>
      </Modal>



      {/* Invite & Collaborators Modal */}
      {project && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          projectId={project._id}
          projectName={project.name}
          isOwner={isOwner}
        />
      )}
      </div>
    </div>
  );
}
