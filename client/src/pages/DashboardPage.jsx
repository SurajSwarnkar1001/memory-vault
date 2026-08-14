import React, { useState } from 'react';
import useProjects from '../hooks/useProjects';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/project/ProjectCard';
import ProjectForm from '../components/project/ProjectForm';
import Modal from '../components/ui/Modal';
import { Plus, FolderPlus, Loader2 } from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Confirmation state for deleting
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (editingProject) {
      await updateProject(editingProject._id, data);
    } else {
      await createProject(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete._id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Desktop left sidebar */}
      <Sidebar currentPath="/dashboard" onNavigate={onNavigate} onCreateProject={handleOpenCreateModal} />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Navbar onNavigate={onNavigate} />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Projects</h1>
            <p className="text-xs text-slate-500 mt-1 hidden sm:block">Manage and track assets for your active workspaces.</p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-semibold shadow-xs transition duration-150 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Projects content grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-slate-200/60 rounded-xl p-5 h-44 flex flex-col justify-between">
                <div>
                  <Skeleton className="h-5 w-1/2 mb-3" />
                  <Skeleton className="h-3 w-full mb-1.5" />
                  <Skeleton className="h-3 w-5/6 mb-4" />
                </div>
                <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Premium Empty State */
          <div className="border border-dashed border-slate-200/80 rounded-xl bg-white p-12 text-center max-w-md mx-auto mt-10">
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No projects yet</h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-[260px] mx-auto leading-relaxed">
              Create your first project vault to start saving notes, files, links, and voice recordings.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-semibold transition duration-150 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard
                key={proj._id}
                project={proj}
                onClick={() => onNavigate(`/project/${proj._id}`)}
                onEdit={() => handleOpenEditModal(proj)}
                onDelete={() => setProjectToDelete(proj)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
        {editingProject && user && (editingProject.userId !== user.id && editingProject.userId !== user._id) ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-red-500 font-semibold leading-relaxed">
              Only the project owner can edit project details.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 hover:text-slate-800 transition duration-150 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <ProjectForm
            project={editingProject}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            submitLabel={editingProject ? 'Save Changes' : 'Create Project'}
          />
        )}
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {projectToDelete && user && (projectToDelete.userId !== user.id && projectToDelete.userId !== user._id) ? (
              <span className="text-red-500 font-semibold">You do not have permission to delete this project. Only the project owner can perform this action.</span>
            ) : (
              <>Are you sure you want to delete <strong className="text-slate-900">"{projectToDelete?.name}"</strong>? This will permanently remove the project and <strong className="text-red-600 font-semibold">all entries</strong> recorded inside it. This action cannot be undone.</>
            )}
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setProjectToDelete(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 hover:text-slate-800 transition duration-150 cursor-pointer"
            >
              {projectToDelete && user && (projectToDelete.userId !== user.id && projectToDelete.userId !== user._id) ? 'Close' : 'Cancel'}
            </button>
            {projectToDelete && user && (projectToDelete.userId === user.id || projectToDelete.userId === user._id) && (
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition duration-150 cursor-pointer font-medium"
              >
                Delete Project
              </button>
            )}
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}
