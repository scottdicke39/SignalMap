"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Calendar, FileIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SavedTemplate {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  extracted_data: any;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: SavedTemplate) => void;
}

export default function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.email) params.append('userId', user.email);

      const response = await fetch(`/api/upload/save?${params}`);
      if (!response.ok) throw new Error('Failed to load templates');

      const { files } = await response.json();
      setTemplates(files);
    } catch (error: any) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      const response = await fetch(`/api/upload/save/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      await loadTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50 rounded-xl">
        <FileText className="w-16 h-16 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-600">No saved templates yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Upload files to build your template library
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">
          Saved Templates ({templates.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate">
                  {template.file_name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>{(template.file_size / 1024).toFixed(1)} KB</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>

                {template.extracted_data?.summary && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {template.extracted_data.summary}
                  </p>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectTemplate(template)}
                  className="rounded-lg"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Use
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteTemplate(template.id)}
                  className="rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

