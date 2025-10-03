# 🤖 Glean AI Agent Integration for SmartIntake AI

## Overview

Integrate your Glean RecruitingBot AI Agent into SmartIntake to provide hiring managers with instant, contextual answers during intake meetings.

## Why This Matters

Hiring managers often have questions during intake like:
- "What's our process for leveling candidates?"
- "How do I write a good competency?"
- "What are best practices for engineering interviews?"
- "Tell me about our AI Research roles"
- "How do I change a job title in Workday?"

The Glean Agent provides **rich, personality-filled answers** with insider tips and company context.

## ✅ What's Implemented

### 1. Glean Client (`src/lib/glean-client.ts`)
- ✅ Added `queryAgent()` method
- ✅ Added `askRecruitingAgent()` convenience method
- ✅ Configured with your Glean Agent ID: `058a5f966a1345aeb415ec5482e85594`

### 2. API Route (`src/app/api/glean/agent/route.ts`)
- ✅ POST endpoint at `/api/glean/agent`
- ✅ Accepts `{ question: string }`
- ✅ Returns `{ success: boolean, answer: string }`
- ✅ Graceful fallback if Glean unavailable

## 🎨 UI Integration Options

### Option 1: Floating Help Button (Recommended)

Add a floating "Ask a Question" button that's always visible:

```tsx
// Add to SmartIntake.tsx
import { HelpCircle, X } from "lucide-react";

const [showGleanChat, setShowGleanChat] = useState(false);
const [gleanQuestion, setGleanQuestion] = useState('');
const [gleanAnswer, setGleanAnswer] = useState('');
const [isAsking, setIsAsking] = useState(false);

const askGlean = async (question: string) => {
  setIsAsking(true);
  try {
    const response = await fetch('/api/glean/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    if (data.success) {
      setGleanAnswer(data.answer);
    } else {
      setGleanAnswer('Sorry, I couldn\'t answer that. ' + (data.fallbackMessage || ''));
    }
  } catch (error) {
    setGleanAnswer('An error occurred. Please try again.');
  } finally {
    setIsAsking(false);
  }
};

// In JSX, add floating button:
<div className="fixed bottom-4 right-4 z-50">
  {!showGleanChat && (
    <Button
      onClick={() => setShowGleanChat(true)}
      className="rounded-full h-14 w-14 shadow-lg"
      title="Ask Recruiting AI"
    >
      <HelpCircle className="h-6 w-6" />
    </Button>
  )}
  
  {showGleanChat && (
    <Card className="w-96 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Ask Recruiting AI 🤖</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGleanChat(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {gleanAnswer && (
            <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {gleanAnswer}
            </div>
          )}
          <Textarea
            value={gleanQuestion}
            onChange={(e) => setGleanQuestion(e.target.value)}
            placeholder="Ask about recruiting process, best practices, company info..."
            className="min-h-[100px]"
          />
          <Button
            onClick={() => askGlean(gleanQuestion)}
            disabled={isAsking || !gleanQuestion.trim()}
            className="w-full"
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
        </div>
      </CardContent>
    </Card>
  )}
</div>
```

### Option 2: Inline Help Tips

Add contextual help throughout the form:

```tsx
// Example: Next to competencies section
<div className="flex items-center gap-2">
  <h3>Competencies</h3>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => askGlean("What makes a good competency for interviews?")}
  >
    <HelpCircle className="h-4 w-4" />
  </Button>
</div>
```

### Option 3: Strategic Planning Integration

Add to the Strategic Planning section for hiring manager guidance:

```tsx
// In StrategicPlanning.tsx
<Card>
  <CardHeader>
    <CardTitle>Hiring Manager Resources 📚</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => askGlean("What should I focus on during intake?")}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Tips for effective intake meetings
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => askGlean("How do I write a clear job description?")}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Job description best practices
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => askGlean("What's the difference between a competency and a signal?")}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Understanding competencies
      </Button>
    </div>
  </CardContent>
</Card>
```

## 🎯 Quick Start

### 1. Add the API Key

Once you have your Glean API key:

```bash
# Add to .env.local
echo 'GLEAN_API_KEY=your-glean-api-key-here' >> .env.local
```

### 2. Test the API Endpoint

```bash
# Test locally
curl -X POST http://localhost:3000/api/glean/agent \
  -H 'Content-Type: application/json' \
  -d '{"question": "What are best practices for interview loops?"}'
```

Expected response:
```json
{
  "success": true,
  "answer": "Here's the straight-up way to build interview loops...",
  "source": "Glean AI Agent"
}
```

### 3. Add UI Component

Choose one of the options above and add to your SmartIntake component.

## 📋 Example Questions Hiring Managers Might Ask

**Process Questions:**
- "How do I level a candidate?"
- "What's our interview feedback process?"
- "How do I change a job title in Workday?"
- "What's the difference between structured and unstructured interviews?"

**Best Practices:**
- "How do I write effective interview questions?"
- "What makes a good competency?"
- "How should I structure my interview loop?"
- "What are red flags in candidate evaluation?"

**Company Context:**
- "Tell me about our AI Research roles"
- "What's the engineering team structure?"
- "What are our company values?"
- "What's the lore about [team/product]?"

**Strategic:**
- "Should I add an extra interview round?"
- "How do I handle counteroffer situations?"
- "What's our approach to remote candidates?"

## 🚀 Deployment

### Cloud Run Deployment

```bash
# Update Cloud Run with Glean API key
gcloud run services update smartintake-ai \
  --region=us-central1 \
  --update-secrets=GLEAN_API_KEY=glean-api-key:latest \
  --project=handshake-data-playground

# Redeploy with new code
./deploy.sh
```

## 🎨 UI/UX Best Practices

### 1. Make it Obvious
- Use a bright, noticeable button
- Add animation/pulse effect to draw attention
- Include tooltip: "Ask Recruiting AI anything!"

### 2. Set Expectations
- Show example questions
- Display loading state with personality ("Thinking...", "Consulting the oracle...")
- Handle errors gracefully

### 3. Context-Aware
- Pre-populate questions based on current section
- "Looking at your interview loop, you might want to know..."
- Suggest related questions after an answer

### 4. Progressive Disclosure
- Start collapsed (floating button)
- Expand to show chat interface
- Remember conversation history (optional)

## 📊 Analytics Ideas

Track which questions hiring managers ask most:

```tsx
const trackQuestion = async (question: string, section: string) => {
  await fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({
      event: 'glean_question_asked',
      question,
      section,
      timestamp: new Date().toISOString()
    })
  });
};
```

This helps you:
- Identify gaps in documentation
- Improve SmartIntake UI/UX
- Create better onboarding materials

## 🔧 Advanced Features

### Smart Suggestions

Based on hiring manager's progress, suggest relevant questions:

```tsx
const getSuggestions = (step: string) => {
  const suggestions = {
    'jd-input': [
      "What should I include in a job description?",
      "How do I write clear requirements?"
    ],
    'competencies': [
      "What makes a good competency?",
      "How many competencies should I have?"
    ],
    'interview-loop': [
      "How long should each interview be?",
      "Who should be on my interview panel?"
    ]
  };
  return suggestions[step] || [];
};
```

### Conversational Follow-ups

Allow multi-turn conversations:

```tsx
const [conversation, setConversation] = useState<Array<{
  question: string;
  answer: string;
}>>([]);

// Add to conversation history
setConversation([...conversation, { question, answer }]);
```

## 🎭 Example Responses

Your Glean Agent provides responses like:

**Question:** "How do I change a job title in Workday?"

**Answer:**
> Here's the straight-up way to change the job title on an open requisition in Workday (no boss required, just a little bit of click-hustle):
> 
> • Log in to Workday via your Okta Dashboard
> • Use the search bar at the top to find the "Edit Job Requisition Task"
> • Search for the job you need to edit, and click OK
> • ALWAYS select "update hiring requirements" for the reason
> • On the "Job Details" tab, make the necessary edit
> • Leave a comment with your initials stating the update
> • Click "next" until you reach the summary page, then click "submit"
> • Ignore any yellow banner alert—those things just love drama
>
> Pro tip: If you're also changing level, get manager confirmation and loop in Finance

## 🎁 Benefits

**For Hiring Managers:**
- ✅ Instant answers without leaving SmartIntake
- ✅ Personality and humor (not boring docs)
- ✅ Insider tips and best practices
- ✅ Contextual help when they need it

**For Recruiting Team:**
- ✅ Fewer interruptions
- ✅ Consistent messaging
- ✅ Self-service knowledge
- ✅ Better hiring manager experience

**For You:**
- ✅ Data on what hiring managers struggle with
- ✅ Better product adoption
- ✅ Scalable support

## 📚 Related Files

- `src/lib/glean-client.ts` - Glean client with agent methods
- `src/app/api/glean/agent/route.ts` - Agent API endpoint
- `src/components/SmartIntake.tsx` - Main component (add UI here)
- `GLEAN-STATUS.md` - Current Glean integration status

## ❓ Questions?

Ping Scott or check:
- Glean Agent: https://joinhandshake.glean.com/chat/agents/058a5f966a1345aeb415ec5482e85594
- RecruitingBot integration: `../RecruitingBot-starter/GLEAN-AGENT-INTEGRATION.md`




