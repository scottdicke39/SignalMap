"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Check, Sparkles } from 'lucide-react';

interface SuggestionItem {
  type: 'competency' | 'mustHave' | 'niceToHave' | 'text' | 'interviewStage';
  content: string;
  rationale?: string;
  added?: boolean;
}

interface ParsedSuggestion {
  title: string;
  items: SuggestionItem[];
  rawText?: string;
}

interface AISuggestionModalProps {
  suggestion: string;
  onClose: () => void;
  onAddItem?: (item: SuggestionItem) => void;
}

export default function AISuggestionModal({ 
  suggestion, 
  onClose,
  onAddItem 
}: AISuggestionModalProps) {
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  // Parse the suggestion to extract structured items
  const parsedSuggestion = parseSuggestion(suggestion);

  const handleAddItem = (item: SuggestionItem, index: number) => {
    if (onAddItem) {
      onAddItem(item);
      setAddedItems(prev => new Set(prev).add(index));
    }
  };

  const handleAddAll = () => {
    if (onAddItem) {
      parsedSuggestion.items.forEach((item, index) => {
        if (!addedItems.has(index)) {
          onAddItem(item);
          setAddedItems(prev => new Set(prev).add(index));
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">{parsedSuggestion.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            Click items to add them to your intake form
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {parsedSuggestion.items.length > 0 ? (
            <div className="space-y-3">
              {parsedSuggestion.items.map((item, index) => (
                <div
                  key={index}
                  className={`group p-4 border-2 rounded-xl transition-all ${
                    addedItems.has(index)
                      ? 'border-green-300 bg-green-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">
                        {item.content}
                      </p>
                      {item.rationale && (
                        <p className="text-sm text-slate-600 mt-1">
                          {item.rationale}
                        </p>
                      )}
                      {item.type !== 'text' && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {formatType(item.type)}
                        </span>
                      )}
                    </div>
                    
                    {onAddItem && (
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(item, index)}
                        disabled={addedItems.has(index)}
                        className={`shrink-0 rounded-xl ${
                          addedItems.has(index)
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        }`}
                      >
                        {addedItems.has(index) ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Fallback to raw text if parsing fails
            <div className="text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
              {parsedSuggestion.rawText || suggestion}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {addedItems.size} of {parsedSuggestion.items.length} items added
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Close
            </Button>
            {onAddItem && parsedSuggestion.items.length > 0 && (
              <Button
                onClick={handleAddAll}
                disabled={addedItems.size === parsedSuggestion.items.length}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                Add All ({parsedSuggestion.items.length - addedItems.size} remaining)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Parse AI suggestion into structured items
function parseSuggestion(text: string): ParsedSuggestion {
  const items: SuggestionItem[] = [];
  let title = 'AI Suggestions';

  // Try to detect the type of suggestion
  if (text.toLowerCase().includes('competenc')) {
    title = 'Suggested Competencies';
    items.push(...parseCompetencies(text));
  } else if (text.toLowerCase().includes('must-have') || text.toLowerCase().includes('must have') || text.toLowerCase().includes('required')) {
    title = 'Must-Have Requirements';
    items.push(...parseBulletPoints(text, 'mustHave'));
  } else if (text.toLowerCase().includes('nice-to-have') || text.toLowerCase().includes('nice to have') || text.toLowerCase().includes('preferred')) {
    title = 'Nice-to-Have Requirements';
    items.push(...parseBulletPoints(text, 'niceToHave'));
  } else if (text.toLowerCase().includes('interview') || text.toLowerCase().includes('stage')) {
    title = 'Interview Stages';
    items.push(...parseBulletPoints(text, 'interviewStage'));
  } else {
    // Generic parsing
    items.push(...parseBulletPoints(text, 'text'));
  }

  return {
    title,
    items: items.length > 0 ? items : [],
    rawText: items.length === 0 ? text : undefined,
  };
}

// Parse competencies (name + rationale)
function parseCompetencies(text: string): SuggestionItem[] {
  const items: SuggestionItem[] = [];
  
  // Pattern: "1. Name - Rationale" or "- Name: Rationale"
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;
    
    // Remove leading bullets/numbers
    const cleaned = trimmed.replace(/^[\d\.\-\*\•]+\s*/, '');
    
    // Try to split by common delimiters
    let name = cleaned;
    let rationale = '';
    
    if (cleaned.includes(' - ')) {
      [name, rationale] = cleaned.split(' - ', 2);
    } else if (cleaned.includes(': ')) {
      [name, rationale] = cleaned.split(': ', 2);
    } else if (cleaned.includes(' – ')) {
      [name, rationale] = cleaned.split(' – ', 2);
    }
    
    if (name.length > 2 && name.length < 100) {
      items.push({
        type: 'competency',
        content: name.trim(),
        rationale: rationale.trim() || undefined,
      });
    }
  }
  
  return items;
}

// Parse bullet point lists
function parseBulletPoints(text: string, type: SuggestionItem['type']): SuggestionItem[] {
  const items: SuggestionItem[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;
    
    // Remove leading bullets/numbers
    const cleaned = trimmed.replace(/^[\d\.\-\*\•]+\s*/, '');
    
    if (cleaned.length > 2 && cleaned.length < 200) {
      items.push({
        type,
        content: cleaned.trim(),
      });
    }
  }
  
  return items;
}

// Format type labels
function formatType(type: SuggestionItem['type']): string {
  const labels = {
    competency: 'Competency',
    mustHave: 'Must-Have',
    niceToHave: 'Nice-to-Have',
    interviewStage: 'Interview Stage',
    text: 'Suggestion',
  };
  return labels[type] || 'Item';
}

