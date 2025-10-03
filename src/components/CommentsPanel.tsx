"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  user_email: string;
  user_name: string | null;
  comment: string;
  section: string | null;
  created_at: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
}

interface CommentsPanelProps {
  intakeId: string;
  section?: string;
}

export default function CommentsPanel({ intakeId, section }: CommentsPanelProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadComments();
    // Poll for new comments every 10 seconds
    const interval = setInterval(loadComments, 10000);
    return () => clearInterval(interval);
  }, [intakeId, section, showResolved]);

  const loadComments = async () => {
    try {
      const params = new URLSearchParams();
      if (section) params.append('section', section);
      if (showResolved) params.append('includeResolved', 'true');

      const response = await fetch(`/api/intakes/${intakeId}/comments?${params}`);
      if (!response.ok) throw new Error('Failed to load comments');
      
      const { comments } = await response.json();
      setComments(comments);
    } catch (err: any) {
      console.error('Error loading comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/intakes/${intakeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user?.email || 'anonymous@handshake.com',
          user_name: user?.email?.split('@')[0] || 'Anonymous',
          comment: newComment,
          section: section || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setNewComment('');
      await loadComments();
    } catch (err: any) {
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (commentId: string, resolved: boolean) => {
    try {
      const response = await fetch(`/api/intakes/${intakeId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          resolved: !resolved,
          resolved_by: user?.email || 'anonymous@handshake.com',
        }),
      });

      if (!response.ok) throw new Error('Failed to update comment');

      await loadComments();
    } catch (err: any) {
      console.error('Error updating comment:', err);
    }
  };

  const unresolvedCount = comments.filter(c => !c.resolved).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
      {/* Header */}
      <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 text-white flex items-center justify-center font-bold shadow-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Discussion</h3>
              <p className="text-sm text-slate-600">
                {unresolvedCount} open {unresolvedCount === 1 ? 'comment' : 'comments'}
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded border-slate-300"
            />
            Show resolved
          </label>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs mt-1">Start the discussion below</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                comment.resolved
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {comment.user_name || comment.user_email.split('@')[0]}
                    </span>
                    {comment.section && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {comment.section}
                      </span>
                    )}
                    {comment.resolved && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleResolved(comment.id, comment.resolved)}
                  className={`p-2 rounded-lg transition-colors ${
                    comment.resolved
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={comment.resolved ? 'Reopen' : 'Mark as resolved'}
                >
                  {comment.resolved ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment}</p>
              {comment.resolved && comment.resolved_by && (
                <p className="text-xs text-slate-500 mt-2">
                  Resolved by {comment.resolved_by.split('@')[0]} on{' '}
                  {new Date(comment.resolved_at!).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="p-6 bg-slate-50 border-t">
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or question..."
            className="min-h-[100px] rounded-xl border-2 border-slate-200 focus:border-blue-400 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddComment();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to send
            </p>
            <Button
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

