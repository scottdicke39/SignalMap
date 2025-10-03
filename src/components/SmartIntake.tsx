"use client"

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LevelSelector } from "@/components/ui/level-selector";
import { 
  Loader2, Sparkles, Send, Upload, CheckCircle2, ExternalLink, 
  ListChecks, FileSpreadsheet, Share2, Link2, Edit, Wand2, Cloud, CloudOff, Save, MessageCircle, X, Check, BookTemplate
} from "lucide-react";
import { EditableCompetencies, EditableOrgContext } from "./EditableSection";
import StrategicPlanning from "./StrategicPlanning";
import EditableInterviewLoop from "./EditableInterviewLoop";
import GleanAssistant from "./GleanAssistant";
import ShareModal from "./ShareModal";
import CommentsPanel from "./CommentsPanel";
import FileUpload from "./FileUpload";
import TemplateLibrary from "./TemplateLibrary";
import AISuggestionModal from "./AISuggestionModal";
import { useIntake } from "@/hooks/useIntake";
import { useAuth } from "@/contexts/AuthContext";

// ---- Types ----
interface Competency {
  name: string;
  rationale?: string;
}

interface StageRec {
  name: string;
  intent: string;
  durationMins: number;
  signals: string[];
  interviewerHints?: string[];
  formTemplateId?: string;
}

interface TemplateHit {
  source: "confluence" | "ashby";
  id: string;
  title: string;
  score: number; // 0..1
  url?: string;
  notes?: string;
}

interface OrgContext {
  manager: string;
  department?: string;
  team: string[];
  crossFunc?: string[];
}

interface ExtractedData {
  level: string;
  function: string;
  mustHaves: string[];
  niceToHaves: string[];
  competencies: Competency[];
  risks: string[];
}

interface LoopPlan {
  stages: StageRec[];
  totalMins: number;
  risks: string[];
}

// ---- API Functions ----
const extractFromJD = async (jd: string, orgContext?: OrgContext): Promise<ExtractedData> => {
  const response = await fetch('/api/openai/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      jobDescription: jd,
      hiringManager: orgContext?.manager,
      department: orgContext?.department || 'Unknown'
    })
  });
  if (!response.ok) throw new Error('Failed to analyze job description');
  return response.json();
};

const fetchOrgContext = async (query: { jobTitle?: string; managerHint?: string }): Promise<OrgContext> => {
  const response = await fetch('/api/glean/org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  if (!response.ok) throw new Error('Failed to fetch org context');
  return response.json();
};

const matchTemplates = async (signalBundle: string[], jobFunction?: string, jobLevel?: string): Promise<TemplateHit[]> => {
  const response = await fetch('/api/templates/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signals: signalBundle, jobFunction, jobLevel })
  });
  if (!response.ok) throw new Error('Failed to match templates');
  return response.json();
};

const synthesizeLoop = async (
  competencies: Competency[],
  org: OrgContext,
  functionHint: string
): Promise<LoopPlan> => {
  const response = await fetch('/api/openai/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competencies, org, functionHint })
  });
  if (!response.ok) throw new Error('Failed to synthesize interview loop');
  return response.json();
};

const publishToConfluence = async (payload: any) => {
  const response = await fetch('/api/confluence/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Failed to publish to Confluence');
  return response.json();
};

const pushToAshby = async (payload: any) => {
  const response = await fetch('/api/ashby/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Failed to push to Ashby');
  return response.json();
};

const getAIAssistance = async (section: string, context: string, jobTitle?: string, company?: string) => {
  const response = await fetch('/api/openai/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, context, jobTitle, company })
  });
  if (!response.ok) throw new Error('Failed to get AI assistance');
  return response.json();
};

const enhanceJobDescription = async (jd: string) => {
  const response = await fetch('/api/openai/enhance-jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription: jd })
  });
  if (!response.ok) throw new Error('Failed to enhance job description');
  return response.json();
};

// ---- UI Component ----
export default function SmartIntake() {
  const [jd, setJd] = useState("");
  const [ashbyJobId, setAshbyJobId] = useState("");
  const [jobTitle, setJobTitle] = useState(""); // For searching Ashby or setting Confluence title
  const [level, setLevel] = useState(""); // L1-L9, M3-M5
  const [busy, setBusy] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [org, setOrg] = useState<OrgContext | null>(null);
  const [templates, setTemplates] = useState<TemplateHit[] | null>(null);
  const [loop, setLoop] = useState<LoopPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced state for collaborative features
  const [showStrategicPlanning, setShowStrategicPlanning] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Persistence with auto-save
  const { user } = useAuth();
  const {
    intake: savedIntake,
    saving,
    lastSaved,
    autoSave,
  } = useIntake();
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-save whenever key data changes (debounced)
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      const dataToSave = {
        title: jobTitle || "Untitled Intake",
        level,
        job_title: jobTitle,
        hiring_manager: org?.manager || "",
        department: org?.department || extracted?.function || "",
        job_description: jd,
        ashby_job_id: ashbyJobId,
        extracted_data: extracted ? JSON.parse(JSON.stringify(extracted)) : null,
        org_context: org ? JSON.parse(JSON.stringify(org)) : null,
        templates: templates ? JSON.parse(JSON.stringify(templates)) : null,
        interview_loop: loop ? JSON.parse(JSON.stringify(loop)) : null,
        status: 'draft' as const,
        created_by: user?.email || 'anonymous@handshake.com',
      };
      
      autoSave(savedIntake?.id || null, dataToSave);
    }, 2000); // 2 second debounce
  }, [jobTitle, level, org, jd, ashbyJobId, extracted, templates, loop, savedIntake?.id, autoSave, user?.email]);
  
  // Trigger auto-save when data changes
  useEffect(() => {
    if (jobTitle || level || jd || ashbyJobId || extracted || org || templates || loop) {
      triggerAutoSave();
    }
  }, [jobTitle, level, jd, ashbyJobId, extracted, org, templates, loop, triggerAutoSave]);

  const totalTime = loop?.totalMins || 0;
  const canPublish = !!loop && !!extracted;

  const handleError = (err: any, operation: string) => {
    console.error(`Error in ${operation}:`, err);
    setError(`Failed to ${operation}: ${err.message}`);
    setBusy(null);
  };

  // Handler to add AI-suggested items to the form
  const handleAddSuggestion = (item: any) => {
    if (item.type === 'competency') {
      const newComp = {
        name: item.content,
        rationale: item.rationale || ''
      };
      setExtracted(prev => ({
        ...prev,
        competencies: [...(prev?.competencies || []), newComp],
        mustHaves: prev?.mustHaves || [],
        niceToHaves: prev?.niceToHaves || [],
        function: prev?.function || '',
        level: prev?.level || '',
        risks: prev?.risks || []
      }));
    } else if (item.type === 'mustHave') {
      setExtracted(prev => ({
        ...prev,
        mustHaves: [...(prev?.mustHaves || []), item.content],
        competencies: prev?.competencies || [],
        niceToHaves: prev?.niceToHaves || [],
        function: prev?.function || '',
        level: prev?.level || '',
        risks: prev?.risks || []
      }));
    } else if (item.type === 'niceToHave') {
      setExtracted(prev => ({
        ...prev,
        niceToHaves: [...(prev?.niceToHaves || []), item.content],
        competencies: prev?.competencies || [],
        mustHaves: prev?.mustHaves || [],
        function: prev?.function || '',
        level: prev?.level || '',
        risks: prev?.risks || []
      }));
    } else if (item.type === 'interviewStage') {
      // Add to interview loop if it exists
      if (loop) {
        setLoop({
          ...loop,
          stages: [...loop.stages, {
            name: item.content,
            intent: '',
            durationMins: 60,
            signals: [],
            interviewerHints: [],
            formTemplateId: undefined
          }]
        });
      }
    }
  };

  // Auto-update function from department when org changes
  useEffect(() => {
    if (org?.department && extracted && extracted.function !== org.department) {
      setExtracted(prev => prev ? {
        ...prev,
        function: org.department || prev.function
      } : prev);
    }
  }, [org?.department, extracted?.function]);

  const analyze = async () => {
    try {
      setError(null);
      if (!level) {
        setError("Please select a level (L1-L9 or M3-M5) before analyzing");
        return;
      }
      setBusy("Analyzing JD with hiring context");
      const res = await extractFromJD(jd, org || undefined);
      // Override level with user input and function with department
      setExtracted({
        ...res,
        level,
        function: org?.department || res.function
      });
      setBusy(null);
    } catch (err) {
      handleError(err, "analyze job description");
    }
  };

  const glean = async () => {
    try {
      setError(null);
      setBusy("Fetching org context from Glean");
      const res = await fetchOrgContext({ jobTitle: extracted?.function });
      setOrg(res);
      setBusy(null);
    } catch (err) {
      handleError(err, "fetch org context");
    }
  };

  const matchTemplatesFn = async () => {
    try {
      setError(null);
      setBusy("Matching templates & forms");
      const signals = (extracted?.competencies || []).map((c: Competency) => c.name);
      const hits = await matchTemplates(signals, extracted?.function, extracted?.level);
      setTemplates(hits);
      setBusy(null);
    } catch (err) {
      handleError(err, "match templates");
    }
  };

  const synthesize = async () => {
    try {
      setError(null);
      setBusy("Synthesizing interview loop");
      const out = await synthesizeLoop(
        extracted?.competencies || [], 
        org || { manager: "TBD", team: [] }, 
        extracted?.function || ""
      );
      setLoop(out);
      setBusy(null);
    } catch (err) {
      handleError(err, "synthesize interview loop");
    }
  };

  // Extract Job ID from Ashby URL if pasted
  const handleAshbyJobIdChange = (value: string) => {
    // Check if it's a full Ashby URL
    const urlMatch = value.match(/jobs\/([a-f0-9-]+)/);
    if (urlMatch) {
      setAshbyJobId(urlMatch[1]);
    } else {
      setAshbyJobId(value);
    }
  };

  const publish = async () => {
    try {
      setError(null);
      setBusy("Publishing to Confluence");
      const payload = { jd, extracted, org, templates, loop, ashbyJobId, jobTitle };
      const res = await publishToConfluence(payload);
      setBusy(null);
      alert(`Published: ${res.url}`);
      if (res.url) window.open(res.url, "_blank");
    } catch (err) {
      handleError(err, "publish to Confluence");
    }
  };

  const pushAshby = async () => {
    try {
      setError(null);
      setBusy("Pushing plan to Ashby");
      const payload = { ashbyJobId, loop, templates };
      const res = await pushToAshby(payload);
      setBusy(null);
      alert(`Ashby updated (job: ${res.jobId}). Stages created: ${res.diff?.stagesCreated || 0}, Forms linked: ${res.diff?.formsLinked || 0}`);
    } catch (err) {
      handleError(err, "push to Ashby");
    }
  };

  // Enhanced functionality handlers
  const handleCompetencyUpdate = (competencies: any[]) => {
    if (extracted) {
      setExtracted({ ...extracted, competencies });
    }
  };

  const handleCompetencyAIEnhance = async () => {
    try {
      setBusy("Enhancing competencies with AI");
      const context = extracted?.competencies?.map(c => `${c.name}: ${c.rationale}`).join('; ') || '';
      const res = await getAIAssistance('competencies', context, extracted?.function);
      setAiSuggestion(res.suggestion);
      setShowAiSuggestion(true);
      setBusy(null);
    } catch (err) {
      handleError(err, "get AI assistance for competencies");
    }
  };

  const handleOrgContextUpdate = (newOrg: any) => {
    setOrg(newOrg);
  };

  const handlePullFromHiringManager = async (hmName: string) => {
    try {
      setBusy("Pulling team context from hiring manager");
      // This would integrate with your org system (Glean, HRIS, etc.)
      const res = await fetchOrgContext({ managerHint: hmName });
      setOrg(res);
      setBusy(null);
    } catch (err) {
      handleError(err, "pull team context");
    }
  };

  const handleStrategicAIAssist = async (section: string, context: string) => {
    try {
      setBusy(`Getting AI assistance for ${section}`);
      const jobTitle = extracted?.function || 'this role';
      const res = await getAIAssistance(section, context, jobTitle);
      setAiSuggestion(res.suggestion);
      setShowAiSuggestion(true);
      setBusy(null);
    } catch (err) {
      handleError(err, `get AI assistance for ${section}`);
    }
  };

  const enhanceJD = async () => {
    try {
      setBusy("Enhancing job description with AI");
      const res = await enhanceJobDescription(jd);
      setAiSuggestion(res.enhancedJD);
      setShowAiSuggestion(true);
      setBusy(null);
    } catch (err) {
      handleError(err, "enhance job description");
    }
  };

  const generateInterviewQuestions = async (stageIndex: number, stage: any) => {
    try {
      setBusy("Generating interview questions with AI");
      const response = await fetch('/api/interviews/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage, 
          jobFunction: extracted?.function,
          competencies: extracted?.competencies 
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate questions');
      const { questions } = await response.json();
      
      // Update the loop with new questions
      if (loop) {
        const updatedStages = [...loop.stages];
        updatedStages[stageIndex] = { ...stage, questions };
        
        const updatedLoop = {
          ...loop,
          stages: updatedStages
        };
        
        setLoop(updatedLoop);
      }
      
      setBusy(null);
    } catch (err) {
      handleError(err, "generate interview questions");
    }
  };

  const generateInterviewRubric = async (stageIndex: number, stage: any, customPrompt?: string) => {
    try {
      setBusy(customPrompt ? "Regenerating rubric with your guidance..." : "Generating evaluation rubric with AI");
      const response = await fetch('/api/interviews/generate-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage, 
          jobFunction: extracted?.function,
          competencies: extracted?.competencies,
          customPrompt 
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate rubric');
      const { rubric } = await response.json();
      
      // Update the loop with new rubric
      if (loop) {
        const updatedStages = [...loop.stages];
        updatedStages[stageIndex] = { ...stage, rubric };
        
        const updatedLoop = {
          ...loop,
          stages: updatedStages
        };
        
        setLoop(updatedLoop);
      }
      
      setBusy(null);
    } catch (err) {
      handleError(err, "generate evaluation rubric");
    }
  };

  const handleImportPlaybook = async () => {
    try {
      setBusy("Searching Confluence for playbooks...");
      
      // Search for playbook based on function and level
      const searchQuery = `${extracted?.function || ''} ${level || ''} playbook hiring`.trim();
      
      const response = await fetch('/api/confluence/best-practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'hiring playbook',
          stage: { name: jobTitle || 'Role' },
          jobFunction: extracted?.function || '',
          searchQuery
        })
      });
      
      if (!response.ok) throw new Error('Failed to search Confluence');
      
      const { practices } = await response.json();
      
      if (practices && practices.length > 0) {
        // Show playbook selection modal
        const selectedPlaybook = practices[0]; // For now, use first result
        
        // Parse and pre-fill strategic planning data
        // This is a simplified version - you'd want to parse the Confluence content
        setShowStrategicPlanning(true);
        setBusy(null);
        
        // TODO: Parse the playbook content and populate StrategicPlanning fields
        alert(`Found playbook: "${selectedPlaybook.title}"\n\nYou can now customize it for this specific role.`);
      } else {
        setBusy(null);
        alert('No playbooks found. Try creating one in Confluence first.');
      }
    } catch (err) {
      handleError(err, "import playbook from Confluence");
    }
  };

  const quickJD = `We are hiring a Senior Product Designer to drive end-to-end product experiences for our student-facing surfaces. You will partner with PM and Eng to deliver intuitive flows, run discovery, and ship high-quality work. Must have strong interaction design and communication skills. Nice to have: system thinking, design systems, analytics literacy.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 font-[Calibri,sans-serif]">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SignalMap
            </h1>
            <p className="text-sm font-medium text-slate-600">by Handshake</p>
            </div>
          </div>
          <p className="text-lg text-slate-700 max-w-3xl">
            Map the signals that matter. Build calibrated interview processes in minutes.
            <span className="font-semibold text-blue-600"> For where your team's going, not where they've been.</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700">Glean Integration</Badge>
              <Badge variant="outline" className="border-purple-200 text-purple-700">Collaborative</Badge>
            </div>
            
            {/* Save Status Indicator */}
            <div className="flex items-center gap-2 text-sm">
              {saving ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Cloud className="w-4 h-4" />
                  <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                </div>
              ) : null}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="border-2 border-green-300 text-green-700 hover:bg-green-50 rounded-xl font-medium gap-2"
              disabled={!savedIntake?.id}
              title={!savedIntake?.id ? "Save your intake first to share it" : "Share with team"}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl font-medium gap-2"
              disabled={!savedIntake?.id}
              title={!savedIntake?.id ? "Save your intake first to add comments" : "View & add comments"}
            >
              <MessageCircle className="w-4 h-4" />
              {showComments ? 'Hide' : 'Show'} Comments
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              View All Intakes
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://joinhandshake.glean.com/chat/agents/058a5f966a1345aeb415ec5482e85594', '_blank')}
              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl font-medium gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Ask Glean AI
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Smart Upload Section */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-lg">
                <Upload className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-slate-900">
                  📄 Smart Upload
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Upload job descriptions or playbooks - AI will auto-fill the form
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="gap-2 rounded-xl"
              >
                <BookTemplate className="w-4 h-4" />
                {showTemplates ? 'Hide' : 'Show'} Templates
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showTemplates && (
              <TemplateLibrary
                onSelectTemplate={(template) => {
                  const data = template.extracted_data;
                  if (data.jobTitle) setJobTitle(data.jobTitle);
                  if (data.level) setLevel(data.level);
                  if (data.jobDescription) setJd(data.jobDescription);
                  if (data.competencies) {
                    setExtracted({
                      ...extracted,
                      competencies: data.competencies,
                      mustHaves: data.mustHaves || [],
                      niceToHaves: data.niceToHaves || [],
                      function: data.department || extracted?.function || '',
                      level: data.level || extracted?.level || '',
                      risks: []
                    });
                  }
                  setShowTemplates(false);
                }}
              />
            )}
            
            <FileUpload
              onFilesProcessed={(result) => {
                const data = result.data;
                if (data.jobTitle) setJobTitle(data.jobTitle);
                if (data.level) setLevel(data.level);
                if (data.jobDescription) setJd(data.jobDescription);
                if (data.hiringManager) {
                  setOrg({
                    manager: data.hiringManager,
                    department: data.department || '',
                    team: [],
                  });
                }
                if (data.competencies || data.mustHaves) {
                  setExtracted({
                    competencies: data.competencies || [],
                    mustHaves: data.mustHaves || [],
                    niceToHaves: data.niceToHaves || [],
                    function: data.department || '',
                    level: data.level || '',
                    risks: []
                  });
                }
              }}
              maxFiles={2}
            />
          </CardContent>
        </Card>

        {/* Step 1: Basic Context - Level, Hiring Manager, Job Title */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Setup: Basic Context</CardTitle>
                <p className="text-sm text-slate-600">Start with level, hiring manager, and job title</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Level <span className="text-red-500">*</span></label>
                <LevelSelector 
                  value={level}
                  onChange={setLevel}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Select IC (L1-L9) or Mgmt (M3-M5)
                </p>
              </div>

              {/* Hiring Manager with Glean lookup */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Hiring Manager <span className="text-red-500">*</span></label>
                <EditableOrgContext 
                  org={org}
                  onUpdate={handleOrgContextUpdate}
                  onPullFromHM={handlePullFromHiringManager}
                />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-700">Job Title <span className="text-red-500">*</span></label>
              <Input 
                value={jobTitle} 
                onChange={(e) => setJobTitle(e.target.value)} 
                placeholder="e.g., Senior Product Designer, Staff Engineer, Engineering Manager" 
                className="text-base rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be used for the Confluence page and Ashby posting
              </p>
            </div>

            {/* Ashby Job URL (optional) */}
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-700">Ashby Job URL or ID <span className="text-slate-400">(optional)</span></label>
              <Input 
                value={ashbyJobId} 
                onChange={(e) => handleAshbyJobIdChange(e.target.value)} 
                placeholder="Paste full URL or just ID: a91e87d8-1d55-44be-9611-3d8c3adfe000" 
                className="rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Paste the full Ashby job URL - the ID will be extracted automatically
              </p>
            </div>

            {/* Validation Message */}
            {(!level || !org?.manager || !jobTitle) && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-amber-900 font-medium flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  Please complete all required fields above before adding job description
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Job Description */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Job Description</CardTitle>
                <p className="text-sm text-slate-600">Add or paste the job description</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea 
              value={jd} 
              onChange={(e) => setJd(e.target.value)} 
              placeholder={quickJD} 
              className="h-48 text-sm rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" 
              disabled={!level || !org?.manager || !jobTitle}
            />
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => setJd(quickJD)}
                disabled={!level || !org?.manager || !jobTitle}
                className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl font-medium"
              >
                <Upload className="w-4 h-4 mr-2" /> Sample JD
              </Button>
              <Button 
                onClick={analyze} 
                disabled={!jd || !level || !org?.manager || !jobTitle || !!busy}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Analyze JD
              </Button>
              <Button 
                variant="outline" 
                onClick={enhanceJD} 
                disabled={!jd || !!busy}
                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl font-medium"
              >
                <Wand2 className="w-4 h-4 mr-2" /> Enhance JD
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Extract & Edit */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Review & Edit Extracted Data</CardTitle>
                <p className="text-sm text-slate-600">AI-extracted requirements and competencies</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!extracted && (
              <div className="text-center py-12 px-6">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
                  <Sparkles className="w-12 h-12 text-blue-600" />
                </div>
                <p className="text-base text-slate-600 font-medium">Click "Analyze JD" above to extract requirements</p>
                <p className="text-sm text-slate-400 mt-1">AI will analyze the job description and pull out key details</p>
              </div>
            )}
            {extracted && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Row label="Level" value={extracted.level} />
                    <Row label="Function" value={extracted.function} />
                  </div>
                  <div>
                    <Row label="Must-haves" value={extracted.mustHaves.join(", ")} />
                    <Row label="Nice-to-haves" value={extracted.niceToHaves.join(", ")} />
                  </div>
                </div>
                
                <EditableCompetencies 
                  competencies={extracted.competencies || []}
                  onUpdate={handleCompetencyUpdate}
                  onAIEnhance={handleCompetencyAIEnhance}
                />
                
                {extracted.risks && extracted.risks.length > 0 && (
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-amber-700">Analysis Risks</div>
                    <ul className="list-disc ml-5 text-amber-800">
                      {extracted.risks.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">4) Interview Process Design</CardTitle>
              <div className="flex gap-2">
                <Button onClick={synthesize} disabled={!extracted || !org || !!busy}>
                  <Sparkles className="w-4 h-4 mr-2" /> Synthesize Loop
                </Button>
                {loop && (
                  <Badge variant={totalTime > 240 ? "destructive" : "secondary"}>
                    Total: {totalTime} mins
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Create a complete interview process with questions, rubrics, and evaluation criteria
            </p>
          </CardHeader>
          <CardContent>
            {loop ? (
              <EditableInterviewLoop
                loop={loop}
                onUpdateLoop={setLoop}
                onGenerateQuestions={generateInterviewQuestions}
                onGenerateRubric={generateInterviewRubric}
              />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <div className="text-sm">No interview process yet</div>
                <div className="text-xs">Use "Synthesize Loop" to generate an interview process</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategic Planning Section */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-lg">
                <ListChecks className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-slate-900">
                  5) Strategic Planning
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Define the bigger picture - ideal candidates, company objectives, and role pitch
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleImportPlaybook()}
                  className="gap-2 rounded-xl border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                  disabled={!!busy}
                >
                  <Upload className="w-4 h-4" />
                  Import Playbook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowStrategicPlanning(!showStrategicPlanning)}
                  className="rounded-xl"
                >
                  {showStrategicPlanning ? 'Hide' : 'Show'} Strategy
                </Button>
              </div>
            </div>
          </CardHeader>
          {showStrategicPlanning && (
            <CardContent>
              <StrategicPlanning onAIAssist={handleStrategicAIAssist} />
            </CardContent>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">6) Publish</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={publish} disabled={!canPublish || !!busy}>
                <Share2 className="w-4 h-4 mr-2" /> Publish to Confluence
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Creates/updates a page in "Hiring → Intakes" with embedded JSON and links.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">7) Push</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={pushAshby} disabled={!canPublish || !ashbyJobId || !!busy}>
                <Send className="w-4 h-4 mr-2" /> Push to Ashby
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Check Ashby templates manually, then push finalized interview stages.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestion Modal */}
        {showAiSuggestion && (
          <AISuggestionModal
            suggestion={aiSuggestion}
            onClose={() => setShowAiSuggestion(false)}
            onAddItem={handleAddSuggestion}
          />
        )}

        {busy && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <div className="text-sm font-medium">{busy}</div>
            </div>
          </div>
        )}

        <footer className="text-xs text-slate-500 text-center mt-6">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> 
            Production-ready with real API integrations
          </div>
        </footer>

        {/* Comments Panel */}
        {showComments && savedIntake?.id && (
          <div className="mt-8">
            <CommentsPanel intakeId={savedIntake.id} />
          </div>
        )}
      </div>
      
      {/* Floating Glean AI Assistant */}
      <GleanAssistant 
        suggestedQuestions={[
          "What makes a good competency for interviews?",
          "How do I write a clear job description?",
          "What's our process for leveling candidates?",
          "Tips for effective intake meetings",
          "How do I change a job title in Workday?",
          "What's the lore about AI Research roles?"
        ]}
      />

      {/* Share Modal */}
      {showShareModal && savedIntake?.id && (
        <ShareModal
          intakeId={savedIntake.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-xs font-semibold text-slate-600 mr-2">{label}</span>
      <span>{value}</span>
    </div>
  );
}
