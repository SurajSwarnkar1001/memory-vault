import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import api from '../../api';

export default function InviteModal({ isOpen, onClose, projectId, projectName }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [devLink, setDevLink] = useState(''); // Fallback if SMTP isn't setup

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setDevLink('');

    try {
      const response = await api.post(`/projects/${projectId}/invite`, { email });
      setSuccessMsg(response.data.message);
      if (response.data.devLink) {
        setDevLink(response.data.devLink);
      }
      setEmail('');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setDevLink('');
    setEmail('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share Project">
      <div className="pt-2">
        <p className="text-sm text-slate-500 mb-4">
          Invite someone to collaborate on <strong>{projectName}</strong>. They will have full access to view, add, edit, and delete entries.
        </p>

        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-md">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-xs text-green-700 font-medium">
                {successMsg}
              </p>
              {devLink && (
                <div className="mt-2 pt-2 border-t border-green-200/50">
                  <p className="text-[10px] text-green-600 mb-1 uppercase tracking-wider font-semibold">Dev Note: SMTP Not Active</p>
                  <p className="text-[10px] text-green-800 break-all bg-white/60 p-1.5 rounded border border-green-100 font-mono">
                    {devLink}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
