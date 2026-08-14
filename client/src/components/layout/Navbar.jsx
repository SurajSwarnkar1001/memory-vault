import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, X, Folder, ChevronRight } from 'lucide-react';

export default function Navbar({ onNavigate }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    setIsSidebarOpen(false);
    await logout();
    onNavigate('/login');
  };

  const handleDashboardClick = () => {
    setIsSidebarOpen(false);
    onNavigate('/dashboard');
  };

  return (
    <>
      {/* Top Navbar (mobile only) */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-14 flex items-center justify-between px-4 sm:px-6 md:hidden">
        {/* Brand logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onNavigate('/dashboard')}
        >
          <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center text-white font-black text-sm shadow-xs">
            I
          </div>
          <span className="font-semibold text-slate-800 text-sm tracking-tight">
            memory vault
          </span>
        </div>

        {/* User Avatar Toggle (mobile only) */}
        {user && (
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer transition"
              title="Open profile settings"
            >
              <UserIcon className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Slide-over Sidebar Drawer (rendered outside the nav tag to prevent backdrop filter bleed) */}
      {user && isSidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden sm:hidden">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Solid White Drawer Content */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-64 bg-[#ffffff] border-l border-slate-200/80 shadow-xl flex flex-col justify-between p-6 transform scale-100 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Settings</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile Summary */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">
                    {user.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Nav Links inside Drawer */}
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                <button
                  onClick={handleDashboardClick}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-slate-400" />
                    <span>All Projects</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Logout Action at Bottom */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-red-200 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition duration-150 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>

              <div className="text-[10px] text-slate-400 text-center pt-2 select-none border-t border-slate-100/50">
                Designed &amp; Developed by{' '}
                <a
                  href="https://github.com/SurajSwarnkar1001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-accent hover:text-accent-dark hover:underline transition"
                >
                  Suraj
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
