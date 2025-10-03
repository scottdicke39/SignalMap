"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Edit, Check, Sparkles, CheckCircle2 } from 'lucide-react';

interface Competency {
  name: string;
  rationale: string;
}

interface EditableCompetenciesProps {
  competencies: Competency[];
  onUpdate: (competencies: Competency[]) => void;
  onAIEnhance: () => void;
}

export function EditableCompetencies({ competencies, onUpdate, onAIEnhance }: EditableCompetenciesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompetencies, setEditedCompetencies] = useState(competencies);
  const [newCompetency, setNewCompetency] = useState({ name: '', rationale: '' });

  const handleSave = () => {
    onUpdate(editedCompetencies);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCompetencies(competencies);
    setIsEditing(false);
  };

  const addCompetency = () => {
    if (newCompetency.name && newCompetency.rationale) {
      setEditedCompetencies([...editedCompetencies, newCompetency]);
      setNewCompetency({ name: '', rationale: '' });
    }
  };

  const removeCompetency = (index: number) => {
    setEditedCompetencies(editedCompetencies.filter((_, i) => i !== index));
  };

  const updateCompetency = (index: number, field: 'name' | 'rationale', value: string) => {
    const updated = [...editedCompetencies];
    updated[index] = { ...updated[index], [field]: value };
    setEditedCompetencies(updated);
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-600">Competencies</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onAIEnhance}>
              <Sparkles className="w-3 h-3 mr-1" />
              AI Enhance
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
        <ul className="text-sm list-disc ml-5 space-y-1">
          {competencies.map((c, i) => (
            <li key={i}>
              <span className="font-medium">{c.name}</span>: {c.rationale}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Edit Competencies</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {editedCompetencies.map((comp, index) => (
        <div key={index} className="grid grid-cols-3 gap-2 items-start">
          <Input
            value={comp.name}
            onChange={(e) => updateCompetency(index, 'name', e.target.value)}
            placeholder="Competency name"
            className="text-sm"
          />
          <Input
            value={comp.rationale}
            onChange={(e) => updateCompetency(index, 'rationale', e.target.value)}
            placeholder="Why it matters"
            className="text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeCompetency(index)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-2 items-end pt-2 border-t">
        <Input
          value={newCompetency.name}
          onChange={(e) => setNewCompetency({ ...newCompetency, name: e.target.value })}
          placeholder="New competency"
          className="text-sm"
        />
        <Input
          value={newCompetency.rationale}
          onChange={(e) => setNewCompetency({ ...newCompetency, rationale: e.target.value })}
          placeholder="Rationale"
          className="text-sm"
        />
        <Button size="sm" onClick={addCompetency}>
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

interface EditableOrgContextProps {
  org: any;
  onUpdate: (org: any) => void;
  onPullFromHM: (hmName: string) => void;
}

export function EditableOrgContext({ org, onUpdate, onPullFromHM }: EditableOrgContextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hmName, setHmName] = useState('');
  const [editedOrg, setEditedOrg] = useState(org);
  const [newTeamMember, setNewTeamMember] = useState('');

  const handleSave = () => {
    onUpdate(editedOrg);
    setIsEditing(false);
  };

  const addTeamMember = () => {
    if (newTeamMember.trim()) {
      setEditedOrg({
        ...editedOrg,
        team: [...(editedOrg.team || []), newTeamMember.trim()]
      });
      setNewTeamMember('');
    }
  };

  const removeTeamMember = (index: number) => {
    setEditedOrg({
      ...editedOrg,
      team: editedOrg.team?.filter((_: any, i: number) => i !== index) || []
    });
  };

  const pullFromHM = () => {
    if (hmName.trim()) {
      onPullFromHM(hmName.trim());
      setHmName('');
    }
  };

  // Show simple input if no org data yet
  if (!isEditing && !org?.manager) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={hmName}
            onChange={(e) => setHmName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hmName.trim()) {
                pullFromHM();
              }
            }}
            placeholder="Enter hiring manager name..."
            className="flex-1"
          />
          <Button 
            onClick={pullFromHM}
            disabled={!hmName.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Lookup
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          ✨ Powered by Glean - will auto-fill title, department, and team info
        </p>
      </div>
    );
  }

  if (!isEditing && org) {
    return (
      <div className="space-y-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-xs font-semibold text-green-800">Manager Info Loaded</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
        <div className="text-sm space-y-2">
          <div><span className="font-medium">Manager:</span> {org.manager}</div>
          {org.department && (
            <div><span className="font-medium">Department:</span> {org.department}</div>
          )}
          {org.team?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Team</div>
              <div className="flex flex-wrap gap-1">
                {org.team?.map((t: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}
          {org.crossFunc?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Cross-functional</div>
              <div className="flex flex-wrap gap-1">
                {org.crossFunc.map((t: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Edit Organization</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium">Hiring Manager</label>
            <Input
              value={editedOrg?.manager || ''}
              onChange={(e) => setEditedOrg({ ...editedOrg, manager: e.target.value })}
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Department</label>
            <Input
              value={editedOrg?.department || ''}
              onChange={(e) => setEditedOrg({ ...editedOrg, department: e.target.value })}
              placeholder="e.g., Operations, Engineering"
              className="mt-1 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={hmName}
            onChange={(e) => setHmName(e.target.value)}
            placeholder="Or enter HM name to pull team"
            className="text-sm"
          />
          <Button size="sm" onClick={pullFromHM}>
            Pull Team
          </Button>
        </div>

        <div>
          <label className="text-xs font-medium">Team Members</label>
          <div className="space-y-2 mt-1">
            {editedOrg?.team?.map((member: string, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={member}
                  onChange={(e) => {
                    const updated = [...editedOrg.team];
                    updated[index] = e.target.value;
                    setEditedOrg({ ...editedOrg, team: updated });
                  }}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTeamMember(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newTeamMember}
                onChange={(e) => setNewTeamMember(e.target.value)}
                placeholder="Add team member"
                className="text-sm"
              />
              <Button size="sm" onClick={addTeamMember}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
