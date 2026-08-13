import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Folder, Plus } from 'lucide-react';

export default function Sidebar({ currentPath, onNavigate, onCreateProject }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('#/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/60 bg-white h-screen sticky top-0 justify-between p-6 shrink-0">
      <div className="space-y-8">
        {/* Logo and Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onNavigate('#/dashboard')}
        >
          <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center text-white font-black text-sm shadow-xs">
            I
          </div>
          <span className="font-semibold text-slate-800 text-sm tracking-tight">
            memory vault
          </span>
        </div>

        {/* Navigation Section */}
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5 px-3">
              Workspaces
            </span>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate('#/dashboard')}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${currentPath === '#/dashboard' || !currentPath.startsWith('#/project/')
                    ? 'bg-accent-light text-accent'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Folder className="h-4 w-4" />
                <span>All Projects</span>
              </button>
            </div>
          </div>

          {/* Quick Action */}
          {onCreateProject && (
            <div className="pt-2">
              <button
                onClick={onCreateProject}
                className="flex items-center justify-center gap-1.5 w-full px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition duration-150 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User profile footer */}
      {user && (
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <UserIcon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-800 truncate">
                {user.name}
              </h4>
              <p className="text-[9px] text-slate-400 truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-red-100 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition duration-150 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
