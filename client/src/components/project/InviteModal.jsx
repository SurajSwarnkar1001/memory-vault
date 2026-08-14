import React, { useState, useEffect } from 'react';
import { Mail, Loader2, Crown, User, Clock } from 'lucide-react';
import Modal from '../ui/Modal';
import api from '../../api';

export default function InviteModal({ isOpen, onClose, projectId, projectName, isOwner }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [devLink, setDevLink] = useState('');

  // Collaborators state
  const [collabData, setCollabData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setLoadingData(true);
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setCollabData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

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
      fetchMembers(); // Refresh the pending invites list
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Collaborators & Sharing">
      <div className="pt-2">
        {/* Only Owner sees the Invite form */}
        {isOwner && (
          <div className="mb-6 pb-6 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Invite New Member</h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Invite someone to collaborate on <strong>{projectName}</strong>. They will have full access to view, add, edit, and delete entries.
            </p>

            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="block w-full pl-9 pr-[100px] py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-accent hover:bg-accent-dark text-white rounded-md text-xs font-medium transition disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Send Invite'}
                </button>
              </div>

              {errorMsg && <p className="text-[10px] text-red-500 font-medium">{errorMsg}</p>}
              
              {successMsg && (
                <div className="bg-green-50 p-2 rounded border border-green-100">
                  <p className="text-[10px] text-green-700 font-medium">{successMsg}</p>
                  {devLink && (
                    <div className="mt-1 pt-1 border-t border-green-200/50">
                      <p className="text-[9px] text-green-600 mb-0.5 uppercase tracking-wider font-semibold">Dev Note: SMTP Not Active</p>
                      <p className="text-[9px] text-green-800 break-all bg-white/60 p-1 rounded border border-green-100 font-mono">{devLink}</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Collaborators List */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Current Members</h3>
          
          {loadingData ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : collabData ? (
            <div className="space-y-4">
              {/* Owner */}
              {collabData.owner && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                      {collabData.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        {collabData.owner.name} <Crown className="h-3 w-3 text-amber-500" />
                      </p>
                      <p className="text-[10px] text-slate-500">{collabData.owner.email}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">Owner</span>
                </div>
              )}

              {/* Members */}
              {collabData.members.map(member => (
                <div key={member._id} className="flex items-center justify-between border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">Member</span>
                </div>
              ))}

              {/* Pending Invites */}
              {isOwner && collabData.pendingInvites && collabData.pendingInvites.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Pending Invitations
                  </h3>
                  <div className="space-y-2">
                    {collabData.pendingInvites.map(invite => (
                      <div key={invite._id} className="flex items-center justify-between border border-slate-100 border-dashed rounded-lg p-2 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <p className="text-[11px] text-slate-600">{invite.email}</p>
                        </div>
                        <span className="text-[9px] font-semibold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">Failed to load collaborators.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
