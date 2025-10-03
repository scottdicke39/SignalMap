"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Edit, Check, Sparkles, Wand2 } from 'lucide-react';

interface RubricCriterion {
  criterion: string;
  excellent: string;
  good: string;
  needs_improvement: string;
  poor: string;
}

interface EditableRubricProps {
  rubric: RubricCriterion[];
  onUpdate: (rubric: RubricCriterion[]) => void;
  onAIGenerate: (prompt: string) => void;
  stageTitle: string;
}

export default function EditableRubric({ 
  rubric, 
  onUpdate, 
  onAIGenerate,
  stageTitle 
}: EditableRubricProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRubric, setEditedRubric] = useState(rubric);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [newCriterion, setNewCriterion] = useState<RubricCriterion>({
    criterion: '',
    excellent: '',
    good: '',
    needs_improvement: '',
    poor: ''
  });

  const handleSave = () => {
    onUpdate(editedRubric);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRubric(rubric);
    setIsEditing(false);
  };

  const addCriterion = () => {
    if (newCriterion.criterion && newCriterion.excellent) {
      setEditedRubric([...editedRubric, newCriterion]);
      setNewCriterion({
        criterion: '',
        excellent: '',
        good: '',
        needs_improvement: '',
        poor: ''
      });
    }
  };

  const removeCriterion = (index: number) => {
    setEditedRubric(editedRubric.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: keyof RubricCriterion, value: string) => {
    const updated = [...editedRubric];
    updated[index] = { ...updated[index], [field]: value };
    setEditedRubric(updated);
  };

  const handleAIGenerate = () => {
    if (aiPrompt.trim()) {
      onAIGenerate(aiPrompt);
      setShowAIPrompt(false);
      setAiPrompt('');
    }
  };

  const suggestedPrompts = [
    'Focus on cultural fit and team collaboration',
    'Emphasize technical depth and problem-solving',
    'Include leadership and mentorship qualities',
    'Assess communication and stakeholder management',
    'Evaluate strategic thinking and business acumen'
  ];

  if (!isEditing && rubric.length > 0) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Evaluation Rubric</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAIPrompt(!showAIPrompt)}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showAIPrompt && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg space-y-3">
              <div>
                <label className="text-sm font-medium">Customize Rubric Generation</label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Focus on leadership qualities and cross-functional collaboration"
                  className="mt-2 text-sm"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600">Quick Suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => setAiPrompt(prompt)}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAIGenerate}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Generate
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAIPrompt(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {rubric.map((criterion, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="font-semibold text-sm text-blue-700">{criterion.criterion}</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-green-700">Excellent:</span>
                    <p className="text-slate-600 mt-1">{criterion.excellent}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">Good:</span>
                    <p className="text-slate-600 mt-1">{criterion.good}</p>
                  </div>
                  <div>
                    <span className="font-medium text-orange-600">Needs Improvement:</span>
                    <p className="text-slate-600 mt-1">{criterion.needs_improvement}</p>
                  </div>
                  <div>
                    <span className="font-medium text-red-600">Poor:</span>
                    <p className="text-slate-600 mt-1">{criterion.poor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Edit Rubric - {stageTitle}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editedRubric.map((criterion, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <Input
                value={criterion.criterion}
                onChange={(e) => updateCriterion(index, 'criterion', e.target.value)}
                placeholder="Criterion name (e.g., Technical Skills)"
                className="font-semibold text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCriterion(index)}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-green-700">Excellent</label>
                <Textarea
                  value={criterion.excellent}
                  onChange={(e) => updateCriterion(index, 'excellent', e.target.value)}
                  placeholder="What does excellent look like?"
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-blue-600">Good</label>
                <Textarea
                  value={criterion.good}
                  onChange={(e) => updateCriterion(index, 'good', e.target.value)}
                  placeholder="What does good look like?"
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-orange-600">Needs Improvement</label>
                <Textarea
                  value={criterion.needs_improvement}
                  onChange={(e) => updateCriterion(index, 'needs_improvement', e.target.value)}
                  placeholder="What needs improvement?"
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-red-600">Poor</label>
                <Textarea
                  value={criterion.poor}
                  onChange={(e) => updateCriterion(index, 'poor', e.target.value)}
                  placeholder="What does poor look like?"
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-3">Add New Criterion</div>
          <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
            <Input
              value={newCriterion.criterion}
              onChange={(e) => setNewCriterion({ ...newCriterion, criterion: e.target.value })}
              placeholder="Criterion name"
              className="text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <Textarea
                value={newCriterion.excellent}
                onChange={(e) => setNewCriterion({ ...newCriterion, excellent: e.target.value })}
                placeholder="Excellent performance"
                className="text-xs"
                rows={2}
              />
              <Textarea
                value={newCriterion.good}
                onChange={(e) => setNewCriterion({ ...newCriterion, good: e.target.value })}
                placeholder="Good performance"
                className="text-xs"
                rows={2}
              />
              <Textarea
                value={newCriterion.needs_improvement}
                onChange={(e) => setNewCriterion({ ...newCriterion, needs_improvement: e.target.value })}
                placeholder="Needs improvement"
                className="text-xs"
                rows={2}
              />
              <Textarea
                value={newCriterion.poor}
                onChange={(e) => setNewCriterion({ ...newCriterion, poor: e.target.value })}
                placeholder="Poor performance"
                className="text-xs"
                rows={2}
              />
            </div>
            <Button size="sm" onClick={addCriterion}>
              <Plus className="w-3 h-3 mr-1" />
              Add Criterion
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

