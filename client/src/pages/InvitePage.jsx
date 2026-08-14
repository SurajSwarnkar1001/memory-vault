import React, { useState, useEffect } from 'react';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function InvitePage({ token, onNavigate }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.get(`/projects/invite/${token}`);
        setInviteData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError('');
    
    try {
      const response = await api.post(`/projects/invite/${token}/accept`);
      // Redirect to the project page!
      onNavigate(`/project/${response.data.projectId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation.');
      setAccepting(false);
    }
  };

  const handleLoginRedirect = () => {
    // You can implement a returnUrl logic in your login page if needed.
    // For now, they can just login and click the link again, or we can route them back.
    localStorage.setItem('returnUrl', `/invite/${token}`);
    onNavigate('/'); // Route them to auth page (home)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header pattern */}
        <div className="h-24 bg-gradient-to-br from-accent to-accent-dark relative">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <div className="absolute -bottom-6 inset-x-0 flex justify-center">
            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-md">
              {error && !inviteData ? (
                <AlertCircle className="h-7 w-7 text-red-500" />
              ) : (
                <Mail className="h-7 w-7 text-accent" />
              )}
            </div>
          </div>
        </div>

        <div className="pt-12 pb-8 px-8 text-center">
          {error && !inviteData ? (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Oops!</h2>
              <p className="text-sm text-slate-500">{error}</p>
              <button 
                onClick={() => onNavigate('/')}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Project Invitation</h2>
              <p className="text-sm text-slate-500 mb-6">
                You have been invited to collaborate on <br/>
                <strong className="text-slate-800 text-base">{inviteData?.projectName}</strong>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                  {error}
                </div>
              )}

              {!user ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-600 mb-4 font-medium">
                    You must be logged in to accept this invitation.
                  </p>
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition shadow-sm shadow-accent/20"
                  >
                    Login / Sign Up
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Logged in as <strong>{user.name}</strong></span>
                  </div>
                  
                  <button
                    onClick={handleAccept}
                    disabled={accepting}
                    className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm shadow-accent/20 disabled:opacity-50"
                  >
                    {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Accept Invitation
                  </button>
                  
                  <button 
                    onClick={() => onNavigate('/')}
                    className="mt-3 w-full py-2.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
                  >
                    Decline & Go Home
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
