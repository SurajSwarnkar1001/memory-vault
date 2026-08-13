import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (projectData) => {
    setError('');
    try {
      const response = await api.post('/projects', projectData);
      setProjects((prev) => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create project';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const updateProject = async (id, projectData) => {
    setError('');
    try {
      const response = await api.patch(`/projects/${id}`, projectData);
      setProjects((prev) =>
        prev.map((proj) => (proj._id === id ? response.data : proj))
      );
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update project';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const deleteProject = async (id) => {
    setError('');
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete project';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
