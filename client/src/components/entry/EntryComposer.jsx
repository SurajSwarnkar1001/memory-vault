import React, { useState, useRef } from 'react';
import { FileText, Link2, Mic, FileUp, Calendar, Tag, Plus, Upload, X } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function EntryComposer({ onSubmit }) {
  const [activeTab, setActiveTab] = useState('text'); // text | link | voice | file
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date());
  
  // File and media states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isAudio && !isVideo) {
      setError('Only image, audio, and video files are supported.');
      setSelectedFile(null);
      return;
    }

    // Enforce 100MB file size limit
    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100MB limit.');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleVoiceSave = async (file) => {
    setLoading(true);
    setError('');
    
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const result = await onSubmit({
      type: 'voice',
      title: title.trim() || 'Voice Memo',
      tags,
      entryDate: new Date(entryDate).toISOString(),
      file,
      onProgress: (percent) => setUploadPercent(percent),
    });

    setLoading(false);
    setUploadPercent(0);

    if (result.success) {
      setTitle('');
      setTagsInput('');
      setActiveTab('text');
    } else {
      setError(result.error || 'Failed to upload voice note');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (['text', 'link'].includes(activeTab) && !textContent.trim()) {
      setError('Content cannot be empty');
      return;
    }

    if (activeTab === 'file' && !selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setError('');
    setLoading(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const entryData = {
      title: title.trim(),
      tags,
      entryDate: entryDate ? entryDate.toISOString() : new Date().toISOString(),
    };

    let result;
    if (activeTab === 'file') {
      let resolvedType = 'image';
      if (selectedFile.type.startsWith('audio/')) resolvedType = 'audio';
      else if (selectedFile.type.startsWith('video/')) resolvedType = 'video';

      result = await onSubmit({
        ...entryData,
        type: resolvedType,
        file: selectedFile,
        onProgress: (percent) => setUploadPercent(percent),
      });
    } else {
      result = await onSubmit({
        ...entryData,
        type: activeTab,
        textContent: textContent.trim(),
      });
    }

    setLoading(false);
    setUploadPercent(0);

    if (result.success) {
      // Reset form states
      setTitle('');
      setTextContent('');
      setTagsInput('');
      setSelectedFile(null);
      if (activeTab === 'file') {
        setActiveTab('text');
      }
    } else {
      setError(result.error || 'Failed to save entry');
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 pb-2 mb-4 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition shrink-0 ${
            activeTab === 'text'
              ? 'bg-accent-light text-accent'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Note</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('link')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition shrink-0 ${
            activeTab === 'link'
              ? 'bg-accent-light text-accent'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>Link</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('voice')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition shrink-0 ${
            activeTab === 'voice'
              ? 'bg-accent-light text-accent'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Mic className="h-3.5 w-3.5" />
          <span>Voice</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition shrink-0 ${
            activeTab === 'file'
              ? 'bg-accent-light text-accent'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <FileUp className="h-3.5 w-3.5" />
          <span>File</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Inputs Form */}
      {activeTab === 'voice' ? (
        <VoiceRecorder onSave={handleVoiceSave} onCancel={() => handleTabChange('text')} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Optional Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full border-0 border-b border-transparent hover:border-slate-100 focus:border-slate-200 px-0 py-1 text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-0 transition duration-150"
              placeholder="Entry Title (Optional)"
            />
          </div>

          {/* Text Content */}
          {['text', 'link'].includes(activeTab) && (
            <div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={3}
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 sm:text-xs transition duration-150 resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={
                  activeTab === 'link' 
                    ? 'Paste URL (e.g. https://github.com)' 
                    : 'Write your memory, notes, or ideas here...'
                }
              />
            </div>
          )}

          {/* File Upload Area */}
          {activeTab === 'file' && (
            <div>
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition duration-150 cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-600 block">Click to select a file</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Supports Image, Audio, or Video (Max 100MB)</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,audio/*,video/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Meta details footer (tags & date selection) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100/50">
            {/* Tags */}
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-300 shrink-0" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-0 transition duration-150"
                placeholder="tags (comma separated, e.g. code, design)"
              />
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-300 shrink-0" />
              <DatePicker
                selected={entryDate}
                onChange={(date) => setEntryDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="yyyy-MM-dd HH:mm"
                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-accent focus:outline-none focus:ring-0 transition duration-150"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end items-center gap-3 pt-2">
            {loading && uploadPercent > 0 && (
              <span className="text-[11px] font-medium text-slate-400">
                Uploading: {uploadPercent}%
              </span>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-semibold shadow-xs transition duration-150 cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{loading ? 'Saving...' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
