"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Users, Trash2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Share {
  id: string;
  shared_with: string;
  permission: 'view' | 'edit' | 'approve';
  shared_by: string;
  created_at: string;
}

interface ShareModalProps {
  intakeId: string;
  onClose: () => void;
}

export default function ShareModal({ intakeId, onClose }: ShareModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit' | 'approve'>('view');
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShares();
  }, [intakeId]);

  const loadShares = async () => {
    try {
      const response = await fetch(`/api/intakes/${intakeId}/share`);
      if (!response.ok) throw new Error('Failed to load shares');
      const { shares } = await response.json();
      setShares(shares);
    } catch (err: any) {
      console.error('Error loading shares:', err);
    }
  };

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/intakes/${intakeId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shared_with: email.toLowerCase().trim(),
          permission,
          shared_by: user?.email || 'anonymous@handshake.com',
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to share');
      }

      setEmail('');
      setPermission('view');
      await loadShares();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/intakes/${intakeId}/share?shareId=${shareId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove share');

      await loadShares();
    } catch (err: any) {
      console.error('Error removing share:', err);
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Share Intake</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 mt-2">Collaborate with your team on this intake</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Share Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Email Address
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="colleague@handshake.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                    className="pl-10 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                  />
                </div>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as any)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="view">Can View</option>
                  <option value="edit">Can Edit</option>
                  <option value="approve">Can Approve</option>
                </select>
                <Button
                  onClick={handleShare}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-6"
                >
                  {loading ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Existing Shares */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              People with access ({shares.length})
            </h3>

            {shares.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No one has access yet</p>
                <p className="text-xs mt-1">Share with your team to collaborate</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{share.shared_with}</div>
                      <div className="text-xs text-slate-500">
                        Shared by {share.shared_by} • {new Date(share.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 capitalize px-3 py-1 bg-white rounded-lg border border-slate-200">
                        {share.permission === 'view' && 'Can View'}
                        {share.permission === 'edit' && 'Can Edit'}
                        {share.permission === 'approve' && 'Can Approve'}
                      </span>
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Permission Descriptions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm space-y-2">
            <h4 className="font-semibold text-blue-900">Permission Levels:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Can View:</strong> Read-only access to the intake</li>
              <li>• <strong>Can Edit:</strong> View and make changes to the intake</li>
              <li>• <strong>Can Approve:</strong> Edit plus approve final version</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

