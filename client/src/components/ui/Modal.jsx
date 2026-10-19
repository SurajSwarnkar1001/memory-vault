import React, { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-md',
  allowFullScreen = false,
  defaultFullScreen = false
}) {
  const [isFullscreen, setIsFullscreen] = useState(defaultFullScreen);

  // Sync fullscreen state when opened
  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(defaultFullScreen);
    }
  }, [isOpen, defaultFullScreen]);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`flex min-h-full items-center justify-center text-center ${isFullscreen ? 'p-2 sm:p-4' : 'p-4'}`}>
        <div className={`relative transform overflow-hidden rounded-xl bg-white text-left align-middle border border-slate-200/80 shadow-2xl transition-all w-full scale-100 animate-in fade-in zoom-in-95 duration-200 ${
          isFullscreen 
            ? 'max-w-[96vw] w-[96vw] h-[92vh] flex flex-col p-5 sm:p-6' 
            : `${maxWidth} p-5 sm:p-6`
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <h3 className="text-base font-semibold text-slate-900 truncate pr-2">
              {title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {allowFullScreen && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150 cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Full Wide Screen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150 cursor-pointer"
                title="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className={`mt-4 ${isFullscreen ? 'flex-1 overflow-y-auto pr-1' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
