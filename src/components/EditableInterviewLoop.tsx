"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import EditableRubric from './EditableRubric';
import { 
  Edit, Save, X, Plus, Sparkles, FileText, Users, Clock,
  ChevronDown, ChevronRight, Lightbulb, Trash2, Move, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'values';
  competency: string;
  followUps?: string[];
}

interface RubricCriteria {
  criterion: string;
  excellent: string;
  good: string;
  needs_improvement: string;
  poor: string;
}

interface InterviewStage {
  name: string;
  intent: string;
  durationMins: number;
  signals: string[];
  interviewerHints?: string[];
  formTemplateId?: string;
  questions?: InterviewQuestion[];
  rubric?: RubricCriteria[];
  presentationPrompt?: {
    title: string;
    context: string;
    deliverables: string[];
    timeLimit: string;
    format: string;
    evaluationCriteria: string[];
    candidateGuidance: string[];
  };
  codeSignalTest?: {
    id: string;
    name: string;
    description: string;
    duration: number;
    skills: string[];
    languages: string[];
    difficulty: string;
    questionCount: number;
  };
}

interface EditableInterviewLoopProps {
  loop: {
    stages: InterviewStage[];
    totalMins: number;
    risks: string[];
  };
  onUpdateLoop: (updatedLoop: any) => void;
  onGenerateQuestions: (stageIndex: number, stage: InterviewStage) => void;
  onGenerateRubric: (stageIndex: number, stage: InterviewStage, customPrompt?: string) => void;
}

export default function EditableInterviewLoop({ 
  loop, 
  onUpdateLoop, 
  onGenerateQuestions, 
  onGenerateRubric 
}: EditableInterviewLoopProps) {
  const [expandedStages, setExpandedStages] = useState<number[]>([]);
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [editingStageName, setEditingStageName] = useState<string>("");

  const toggleStageExpansion = (index: number) => {
    setExpandedStages(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const updateStage = (stageIndex: number, updatedStage: InterviewStage) => {
    const updatedStages = [...loop.stages];
    updatedStages[stageIndex] = updatedStage;
    
    const updatedLoop = {
      ...loop,
      stages: updatedStages,
      totalMins: updatedStages.reduce((sum, stage) => sum + stage.durationMins, 0)
    };
    
    onUpdateLoop(updatedLoop);
  };

  const addQuestion = (stageIndex: number) => {
    const stage = loop.stages[stageIndex];
    const newQuestion: InterviewQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'behavioral',
      competency: stage.signals[0] || 'General',
      followUps: []
    };
    
    updateStage(stageIndex, {
      ...stage,
      questions: [...(stage.questions || []), newQuestion]
    });
  };

  const updateQuestion = (stageIndex: number, questionId: string, updatedQuestion: Partial<InterviewQuestion>) => {
    const stage = loop.stages[stageIndex];
    const updatedQuestions = (stage.questions || []).map(q => 
      q.id === questionId ? { ...q, ...updatedQuestion } : q
    );
    
    updateStage(stageIndex, {
      ...stage,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (stageIndex: number, questionId: string) => {
    const stage = loop.stages[stageIndex];
    const updatedQuestions = (stage.questions || []).filter(q => q.id !== questionId);
    
    updateStage(stageIndex, {
      ...stage,
      questions: updatedQuestions
    });
  };

  // Stage management functions
  const addStage = () => {
    const stageTemplates = [
      { name: "Tech Screen", intent: "Assess technical competency", duration: 60, signals: ["Technical Skills"] },
      { name: "Presentation Round", intent: "Evaluate presentation skills and case study approach", duration: 75, signals: ["Communication", "Problem Solving"] },
      { name: "Executive Interview", intent: "Final round with senior leadership", duration: 45, signals: ["Leadership", "Strategic Thinking"] },
      { name: "Custom Stage", intent: "Define custom interview stage", duration: 45, signals: ["General"] }
    ];
    
    const newStage: InterviewStage = {
      name: "New Stage",
      intent: "Define the purpose of this interview stage",
      durationMins: 45,
      signals: ["Competency"],
      interviewerHints: ["TBD"],
      questions: [],
      rubric: []
    };

    const updatedStages = [...loop.stages, newStage];
    
    const updatedLoop = {
      ...loop,
      stages: updatedStages,
      totalMins: updatedStages.reduce((sum, stage) => sum + stage.durationMins, 0)
    };
    
    onUpdateLoop(updatedLoop);
  };

  const deleteStage = (stageIndex: number) => {
    if (loop.stages.length <= 1) return; // Don't allow deleting the last stage
    
    const updatedStages = loop.stages.filter((_, index) => index !== stageIndex);
    
    const updatedLoop = {
      ...loop,
      stages: updatedStages,
      totalMins: updatedStages.reduce((sum, stage) => sum + stage.durationMins, 0)
    };
    
    onUpdateLoop(updatedLoop);
    
    // Clean up expanded states
    setExpandedStages(prev => 
      prev.filter(index => index < stageIndex).concat(
        prev.filter(index => index > stageIndex).map(index => index - 1)
      )
    );
  };

  const moveStage = (stageIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && stageIndex === 0) return;
    if (direction === 'down' && stageIndex === loop.stages.length - 1) return;
    
    const updatedStages = [...loop.stages];
    const targetIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;
    
    // Swap stages
    [updatedStages[stageIndex], updatedStages[targetIndex]] = 
    [updatedStages[targetIndex], updatedStages[stageIndex]];
    
    const updatedLoop = {
      ...loop,
      stages: updatedStages,
      totalMins: updatedStages.reduce((sum, stage) => sum + stage.durationMins, 0)
    };
    
    onUpdateLoop(updatedLoop);
  };

  const startEditingStageName = (stageIndex: number) => {
    setEditingStage(stageIndex);
    setEditingStageName(loop.stages[stageIndex].name);
  };

  const saveStageNameEdit = (stageIndex: number) => {
    const stage = loop.stages[stageIndex];
    updateStage(stageIndex, {
      ...stage,
      name: editingStageName
    });
    setEditingStage(null);
    setEditingStageName("");
  };

  const cancelStageNameEdit = () => {
    setEditingStage(null);
    setEditingStageName("");
  };

  const generatePresentationPrompt = async (stageIndex: number) => {
    try {
      const stage = loop.stages[stageIndex];
      
      const response = await fetch('/api/interviews/generate-presentation-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          jobFunction: 'Engineering', // TODO: Get from props
          competencies: stage.signals,
          existingPrompt: stage.presentationPrompt ? JSON.stringify(stage.presentationPrompt) : null
        })
      });

      if (!response.ok) throw new Error('Failed to generate presentation prompt');
      
      const data = await response.json();
      
      updateStage(stageIndex, {
        ...stage,
        presentationPrompt: data.presentationPrompt
      });
      
    } catch (error) {
      console.error('Error generating presentation prompt:', error);
    }
  };

  const suggestCodeSignalTest = async (stageIndex: number) => {
    try {
      const stage = loop.stages[stageIndex];
      
      const response = await fetch('/api/codesignal/suggest-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobFunction: 'Engineering', // TODO: Get from props
          competencies: stage.signals,
          experienceLevel: 'Mid', // TODO: Get from props
          techStack: ['JavaScript', 'Python'] // TODO: Get from props
        })
      });

      if (!response.ok) throw new Error('Failed to suggest CodeSignal test');
      
      const data = await response.json();
      
      // Use the first suggested test
      const suggestedTest = data.tests?.[0];
      if (suggestedTest) {
        updateStage(stageIndex, {
          ...stage,
          codeSignalTest: suggestedTest
        });
      }
      
    } catch (error) {
      console.error('Error suggesting CodeSignal test:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Interview Process</h3>
          <p className="text-sm text-slate-600">
            {loop.stages.length} stages • {loop.totalMins} minutes total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addStage}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Stage
          </Button>
          <Badge 
            variant={loop.totalMins > 240 ? "destructive" : "secondary"} 
            className="flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            {loop.totalMins}m
          </Badge>
        </div>
      </div>

      {/* Risks */}
      {loop.risks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium mb-1">
            <Lightbulb className="w-4 h-4" />
            Process Risks
          </div>
          <ul className="text-sm text-amber-700 list-disc list-inside">
            {loop.risks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interview Stages */}
      <div className="space-y-3">
        {loop.stages.map((stage, stageIndex) => (
          <motion.div
            key={stageIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stageIndex * 0.05 }}
          >
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => toggleStageExpansion(stageIndex)}
                  >
                    {expandedStages.includes(stageIndex) ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <div className="flex-1">
                      {editingStage === stageIndex ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingStageName}
                            onChange={(e) => setEditingStageName(e.target.value)}
                            className="text-base font-medium h-8"
                            onKeyPress={(e) => e.key === 'Enter' && saveStageNameEdit(stageIndex)}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => saveStageNameEdit(stageIndex)}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelStageNameEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <CardTitle className="text-base">{stage.name}</CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{stage.intent}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{stage.durationMins}m</Badge>
                    <div className="flex flex-wrap gap-1">
                      {stage.signals.map((signal) => (
                        <Badge key={signal} variant="secondary" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Stage Management Controls */}
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingStageName(stageIndex);
                        }}
                        title="Edit stage name"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStage(stageIndex, 'up');
                        }}
                        disabled={stageIndex === 0}
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStage(stageIndex, 'down');
                        }}
                        disabled={stageIndex === loop.stages.length - 1}
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${stage.name}" stage?`)) {
                            deleteStage(stageIndex);
                          }
                        }}
                        disabled={loop.stages.length <= 1}
                        title="Delete stage"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {stage.interviewerHints && stage.interviewerHints.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-3 h-3" />
                    <span>Suggested: {stage.interviewerHints.join(', ')}</span>
                  </div>
                )}
              </CardHeader>

              <AnimatePresence>
                {expandedStages.includes(stageIndex) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-0">
                      
                      {/* Questions Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Interview Questions</h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onGenerateQuestions(stageIndex, stage)}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Generate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addQuestion(stageIndex)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Question
                            </Button>
                          </div>
                        </div>

                        {/* Questions List */}
                        {stage.questions && stage.questions.length > 0 ? (
                          <div className="space-y-3">
                            {stage.questions.map((question, qIndex) => (
                              <QuestionEditor
                                key={question.id}
                                question={question}
                                onUpdate={(updated) => updateQuestion(stageIndex, question.id, updated)}
                                onRemove={() => removeQuestion(stageIndex, question.id)}
                                availableCompetencies={stage.signals}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm">No questions yet</p>
                            <p className="text-xs">Use "AI Generate" or "Add Question" to get started</p>
                          </div>
                        )}

                        {/* Rubric Section */}
                        <div className="border-t pt-4">
                          {stage.rubric && stage.rubric.length > 0 ? (
                            <EditableRubric
                              rubric={stage.rubric}
                              onUpdate={(updatedRubric) => {
                                const updatedStages = [...loop.stages];
                                updatedStages[stageIndex] = { 
                                  ...updatedStages[stageIndex], 
                                  rubric: updatedRubric 
                                };
                                onUpdateLoop({ ...loop, stages: updatedStages });
                              }}
                              onAIGenerate={(prompt) => onGenerateRubric(stageIndex, stage, prompt)}
                              stageTitle={stage.name}
                            />
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-sm">Evaluation Rubric</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onGenerateRubric(stageIndex, stage)}
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Generate Rubric
                                </Button>
                              </div>
                              <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                                <p className="text-sm">No rubric defined</p>
                                <p className="text-xs">Generate an evaluation rubric for consistent scoring</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Presentation Prompt Section */}
                        {(stage.name.toLowerCase().includes('presentation') || stage.presentationPrompt) && (
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">Presentation Prompt</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generatePresentationPrompt(stageIndex)}
                              >
                                <Lightbulb className="w-3 h-3 mr-1" />
                                {stage.presentationPrompt ? 'Regenerate' : 'Generate'} Prompt
                              </Button>
                            </div>

                            {stage.presentationPrompt ? (
                              <PresentationPromptDisplay prompt={stage.presentationPrompt} />
                            ) : (
                              <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                                <p className="text-sm">No presentation prompt defined</p>
                                <p className="text-xs">Generate a comprehensive presentation challenge</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CodeSignal Test Section */}
                        {(stage.name.toLowerCase().includes('tech') || stage.name.toLowerCase().includes('coding') || stage.codeSignalTest) && (
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">CodeSignal Assessment</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => suggestCodeSignalTest(stageIndex)}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                {stage.codeSignalTest ? 'Change' : 'Suggest'} Test
                              </Button>
                            </div>

                            {stage.codeSignalTest ? (
                              <CodeSignalTestDisplay test={stage.codeSignalTest} />
                            ) : (
                              <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                                <p className="text-sm">No CodeSignal test selected</p>
                                <p className="text-xs">Get AI-suggested coding assessments for this role</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Question Editor Component
function QuestionEditor({ 
  question, 
  onUpdate, 
  onRemove, 
  availableCompetencies 
}: {
  question: InterviewQuestion;
  onUpdate: (updated: Partial<InterviewQuestion>) => void;
  onRemove: () => void;
  availableCompetencies: string[];
}) {
  const [isEditing, setIsEditing] = useState(!question.question);

  const questionTypes = [
    { value: 'behavioral', label: 'Behavioral', color: 'bg-blue-100 text-blue-800' },
    { value: 'technical', label: 'Technical', color: 'bg-green-100 text-green-800' },
    { value: 'situational', label: 'Situational', color: 'bg-purple-100 text-purple-800' },
    { value: 'values', label: 'Values', color: 'bg-orange-100 text-orange-800' }
  ];

  const currentType = questionTypes.find(t => t.value === question.type) || questionTypes[0];

  if (isEditing) {
    return (
      <div className="border rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {questionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onUpdate({ type: type.value as any })}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  question.type === type.value ? type.color : 'bg-gray-100 text-gray-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsEditing(false)}>
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={onRemove}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <Textarea
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Enter your interview question..."
          className="min-h-20"
        />
        
        <div className="grid md:grid-cols-2 gap-2">
          <select
            value={question.competency}
            onChange={(e) => onUpdate({ competency: e.target.value })}
            className="px-3 py-1 border rounded text-sm"
          >
            {availableCompetencies.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 hover:bg-slate-50 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${currentType.color}`}>
              {currentType.label}
            </span>
            <Badge variant="outline" className="text-xs">{question.competency}</Badge>
          </div>
          <p className="text-sm">{question.question || 'Enter question...'}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Rubric Display Component
function RubricDisplay({ rubric }: { rubric: RubricCriteria[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-slate-200 rounded-lg">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-200 p-2 text-left font-medium">Criteria</th>
            <th className="border border-slate-200 p-2 text-center font-medium text-green-700">Excellent</th>
            <th className="border border-slate-200 p-2 text-center font-medium text-blue-700">Good</th>
            <th className="border border-slate-200 p-2 text-center font-medium text-orange-700">Needs Work</th>
            <th className="border border-slate-200 p-2 text-center font-medium text-red-700">Poor</th>
          </tr>
        </thead>
        <tbody>
          {rubric.map((criteria, index) => (
            <tr key={index}>
              <td className="border border-slate-200 p-2 font-medium">{criteria.criterion}</td>
              <td className="border border-slate-200 p-2 text-xs">{criteria.excellent}</td>
              <td className="border border-slate-200 p-2 text-xs">{criteria.good}</td>
              <td className="border border-slate-200 p-2 text-xs">{criteria.needs_improvement}</td>
              <td className="border border-slate-200 p-2 text-xs">{criteria.poor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Presentation Prompt Display Component
function PresentationPromptDisplay({ prompt }: { 
  prompt: {
    title: string;
    context: string;
    deliverables: string[];
    timeLimit: string;
    format: string;
    evaluationCriteria: string[];
    candidateGuidance: string[];
  }
}) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div>
        <h5 className="font-semibold text-lg text-purple-900 mb-2">{prompt.title}</h5>
        <p className="text-sm text-gray-700">{prompt.context}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h6 className="font-medium text-sm text-purple-800 mb-2">Deliverables:</h6>
          <ul className="text-xs text-gray-600 space-y-1">
            {prompt.deliverables.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-purple-500 font-medium">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h6 className="font-medium text-sm text-purple-800 mb-2">Format & Timing:</h6>
          <div className="text-xs text-gray-600 space-y-1">
            <div><span className="font-medium">Time:</span> {prompt.timeLimit}</div>
            <div><span className="font-medium">Format:</span> {prompt.format}</div>
          </div>
        </div>
      </div>

      <div>
        <h6 className="font-medium text-sm text-purple-800 mb-2">Evaluation Criteria:</h6>
        <ul className="text-xs text-gray-600 space-y-1">
          {prompt.evaluationCriteria.map((criteria, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-purple-500 font-medium">•</span>
              {criteria}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-indigo-50 p-3 rounded border">
        <h6 className="font-medium text-sm text-indigo-800 mb-2">Candidate Guidance:</h6>
        <ul className="text-xs text-indigo-700 space-y-1">
          {prompt.candidateGuidance.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-indigo-400 font-medium">💡</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// CodeSignal Test Display Component
function CodeSignalTestDisplay({ test }: {
  test: {
    id: string;
    name: string;
    description: string;
    duration: number;
    skills: string[];
    languages: string[];
    difficulty: string;
    questionCount: number;
  }
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div>
        <h5 className="font-semibold text-lg text-blue-900 mb-1">{test.name}</h5>
        <p className="text-sm text-gray-700">{test.description}</p>
      </div>
      
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>{test.duration} minutes</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-blue-600" />
          <span>{test.questionCount} questions</span>
        </div>
        <Badge className={getDifficultyColor(test.difficulty)}>
          {test.difficulty}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <h6 className="font-medium text-sm text-blue-800 mb-2">Skills Assessed:</h6>
          <div className="flex flex-wrap gap-1">
            {test.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h6 className="font-medium text-sm text-blue-800 mb-2">Languages:</h6>
          <div className="flex flex-wrap gap-1">
            {test.languages.map((lang, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded border text-xs text-blue-800">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-3 h-3" />
          <span className="font-medium">CodeSignal Integration</span>
        </div>
        <p>This assessment can be sent directly to candidates through CodeSignal platform. Requires API setup.</p>
      </div>
    </div>
  );
}
