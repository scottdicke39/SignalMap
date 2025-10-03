"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, X, Sparkles, Loader2, MessageCircle } from "lucide-react";

interface GleanAssistantProps {
  // Optional: Pre-populate with questions based on context
  suggestedQuestions?: string[];
  // Optional: Track which section the user is in
  currentSection?: string;
}

export default function GleanAssistant({ suggestedQuestions, currentSection }: GleanAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState('');
  
  const defaultSuggestions = [
    "What makes a good competency for interviews?",
    "How do I write a clear job description?",
    "What's our process for leveling candidates?",
    "Tips for effective intake meetings"
  ];

  const suggestions = suggestedQuestions || defaultSuggestions;

  const askQuestion = async (q: string) => {
    if (!q.trim()) return;
    
    setIsAsking(true);
    setError('');
    setQuestion(q);
    
    try {
      const response = await fetch('/api/glean/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });

      const data = await response.json();

      if (data.success) {
        setAnswer(data.answer);
      } else {
        setError(data.fallbackMessage || 'Sorry, I couldn\'t answer that question.');
      }
    } catch (err) {
      console.error('Error asking Glean Agent:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    askQuestion(suggestion);
  };

  const handleClear = () => {
    setQuestion('');
    setAnswer('');
    setError('');
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 relative group"
              title="Ask Recruiting AI anything!"
            >
              <MessageCircle className="h-7 w-7" />
              
              {/* Pulse animation */}
              <span className="absolute inset-0 rounded-full bg-purple-400 opacity-75 group-hover:opacity-0 animate-ping" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[450px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Recruiting AI Assistant</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Answer Display */}
                {answer && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">ANSWER:</div>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto border-2 border-purple-200 dark:border-purple-800">
                      {answer}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="w-full"
                    >
                      Ask another question
                    </Button>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 p-3 rounded-lg text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                {/* Question Input */}
                {!answer && (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground font-medium">ASK A QUESTION:</div>
                    
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          askQuestion(question);
                        }
                      }}
                      placeholder="Ask about recruiting process, best practices, company info..."
                      className="min-h-[100px] resize-none"
                      disabled={isAsking}
                    />

                    <Button
                      onClick={() => askQuestion(question)}
                      disabled={isAsking || !question.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isAsking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Ask Question
                        </>
                      )}
                    </Button>

                    {/* Suggested Questions */}
                    {suggestions.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground font-medium">SUGGESTED QUESTIONS:</div>
                        <div className="space-y-1.5">
                          {suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              disabled={isAsking}
                              className="w-full text-left px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-start gap-2">
                                <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                                <span>{suggestion}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}




