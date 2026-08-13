import { useState, useCallback } from 'react';
import axios from 'axios';
import api from '../api';

export default function useEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = useCallback(async (projectId, filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const { type, tag, from, to, search } = filters;
      const params = {};
      if (type) params.type = type;
      if (tag) params.tag = tag;
      if (from) params.from = from;
      if (to) params.to = to;
      if (search) params.search = search;

      const response = await api.get(`/projects/${projectId}/entries`, { params });
      setEntries(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTextOrLinkEntry = async (projectId, entryData) => {
    setError('');
    try {
      const response = await api.post(`/projects/${projectId}/entries`, entryData);
      setEntries((prev) => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create entry';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const uploadFile = async (projectId, file, entryData, onProgress) => {
    setError('');
    try {
      // 1. Get presigned upload URL
      const urlResponse = await api.post(`/projects/${projectId}/entries/upload-url`, {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
      });
      const { uploadUrl, fileKey } = urlResponse.data;

      // 2. Upload directly to Cloudflare R2
      // Using standard axios to avoid global headers (like Bearer JWT) which S3 rejects
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      // 3. Confirm upload and save to MongoDB
      const confirmResponse = await api.post(`/projects/${projectId}/entries/confirm-upload`, {
        ...entryData,
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      });

      setEntries((prev) => [confirmResponse.data, ...prev]);
      return { success: true, data: confirmResponse.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'File upload failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const updateEntry = async (entryId, entryData) => {
    setError('');
    try {
      const response = await api.patch(`/entries/${entryId}`, entryData);
      setEntries((prev) =>
        prev.map((entry) => (entry._id === entryId ? response.data : entry))
      );
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update entry';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const deleteEntry = async (entryId) => {
    setError('');
    try {
      await api.delete(`/entries/${entryId}`);
      setEntries((prev) => prev.filter((entry) => entry._id !== entryId));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete entry';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  return {
    entries,
    setEntries,
    loading,
    error,
    fetchEntries,
    createTextOrLinkEntry,
    uploadFile,
    updateEntry,
    deleteEntry,
  };
}
