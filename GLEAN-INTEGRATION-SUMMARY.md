# 🎉 Glean AI Agent Integration - Complete!

## What We Built

Your Glean RecruitingBot AI Agent (`058a5f966a1345aeb415ec5482e85594`) is now integrated into **both** SmartIntake AI and the Slack RecruitingBot!

## ✅ SmartIntake AI Integration

### Files Created/Modified:

1. **`src/lib/glean-client.ts`**
   - Added `queryAgent(agentId, question)` method
   - Added `askRecruitingAgent(question)` convenience method
   - Uses your Glean Agent ID automatically

2. **`src/app/api/glean/agent/route.ts`** ⭐ NEW
   - POST endpoint: `/api/glean/agent`
   - Accepts: `{ question: string }`
   - Returns: `{ success: boolean, answer: string }`

3. **`src/components/GleanAssistant.tsx`** ⭐ NEW
   - Beautiful floating chat button
   - Smooth animations (Framer Motion)
   - Suggested questions
   - Context-aware suggestions
   - Error handling & loading states

### Documentation Created:

- ✅ `GLEAN-AGENT-INTEGRATION.md` - Full technical guide
- ✅ `HOW-TO-ADD-GLEAN-ASSISTANT.md` - 2-minute quick start

### How to Use:

**Option 1: Quick Start (Recommended)**
```tsx
// In SmartIntake.tsx, add one line:
import GleanAssistant from "./GleanAssistant";

// In JSX, add anywhere:
<GleanAssistant />
```

**Option 2: Context-Aware**
```tsx
<GleanAssistant 
  suggestedQuestions={[
    "What makes a good competency?",
    "How do I write a job description?"
  ]}
  currentSection="competencies"
/>
```

### What Hiring Managers Get:

🎯 **Floating Button** - Always accessible in bottom-right  
💬 **Smart Q&A** - Ask anything about recruiting  
✨ **Rich Answers** - Personality, insider tips, humor  
🚀 **Instant** - No leaving SmartIntake  

### Example Questions:

- "What makes a good competency for interviews?"
- "How do I write a clear job description?"
- "What's our process for leveling candidates?"
- "Tips for effective intake meetings"
- "How do I change a job title in Workday?"
- "Tell me about our AI Research roles"

## ✅ Slack RecruitingBot Integration

### Files Created/Modified:

1. **`RecruitingBot-starter/glean-integration.js`**
   - Added `queryAgent()` and `askAgent()` methods
   - Configured with your agent ID

2. **`RecruitingBot-starter/assistant-config.js`**
   - Added `ask_glean_agent` function (marked PRIORITY)
   - Updated system prompt to use Glean Agent first

3. **`RecruitingBot-starter/index.js`**
   - Added `ask_glean_agent` handler
   - Routes company knowledge questions to Glean Agent

### Documentation Created:

- ✅ `GLEAN-AGENT-INTEGRATION.md` - Full deployment guide

### What Slack Users Get:

When someone asks in Slack:
```
@RecruitingBot what's the lore about AI Research roles?
```

The bot:
1. Recognizes it's a company knowledge question
2. Calls your Glean Agent
3. Returns the rich, personality-filled answer

**Before (Confluence):**
> The Handshake AI Fellowship is designed for PhD/Masters students...
> [Generic, templated response]

**After (Glean Agent):**
> Here's the real story—the "lore"—behind Handshake AI Research...
> [Rich context, insider tips, personality]

## 🔑 Next Steps (Requires Glean API Key)

### 1. Get API Key

Visit: `https://joinhandshake.glean.com/admin/api`

Create a token with permissions:
- ✅ `query_agents` - Query AI agents
- ✅ `search` - Search (optional, for fallback)

### 2. Add to SmartIntake

```bash
cd /Users/scott.dicke/Downloads/SmartIntake-AI
echo 'GLEAN_API_KEY=your-key-here' >> .env.local
```

Test locally:
```bash
npm run dev
```

Visit http://localhost:3000 and click the floating button!

### 3. Add to RecruitingBot

```bash
cd /Users/scott.dicke/Downloads/RecruitingBot-starter
echo 'GLEAN_API_KEY=your-key-here' >> .env
node test-glean-agent.js
```

### 4. Deploy Both

**SmartIntake AI:**
```bash
cd /Users/scott.dicke/Downloads/SmartIntake-AI

# Update Cloud Run secret
gcloud run services update smartintake-ai \
  --region=us-central1 \
  --update-secrets=GLEAN_API_KEY=glean-api-key:latest \
  --project=handshake-data-playground

# Redeploy
./deploy.sh
```

**RecruitingBot:**
```bash
cd /Users/scott.dicke/Downloads/RecruitingBot-starter

# Build (in Google Cloud Shell)
docker build --no-cache --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/handshake-data-playground/recruiting-agent/recruiting-agent:glean-agent .

docker push us-central1-docker.pkg.dev/handshake-data-playground/recruiting-agent/recruiting-agent:glean-agent

# Update secret
gcloud run services update recruiting-agent \
  --region=us-central1 \
  --update-secrets=GLEAN_API_KEY=glean-api-key:latest \
  --project=handshake-data-playground

# Deploy
gcloud run deploy recruiting-agent \
  --image=us-central1-docker.pkg.dev/handshake-data-playground/recruiting-agent/recruiting-agent:glean-agent \
  --region=us-central1 \
  --project=handshake-data-playground
```

## 🎯 Why This Matters

### Before:
- Generic, templated responses
- Missing insider knowledge
- Overly formal tone
- Limited context

### After:
- **Rich, specific answers**
- **Insider tips and cultural context**
- **Personality and humor**
- **Deep company knowledge**

### Real Example:

**Question:** "How do I change a job title in Workday?"

**Old Response (40 lines of generic steps)**

**New Glean Agent Response:**
> Here's the straight-up way to change the job title on an open requisition in Workday (no boss required, just a little bit of click-hustle):
> 
> • Log in to Workday via your Okta Dashboard
> • Use the search bar at the top to find the "Edit Job Requisition Task"
> • ALWAYS select "update hiring requirements" for the reason
> • On the "Job Details" tab, make the necessary edit
> • Leave a comment with your initials stating the update
> • Click "next" until you reach the summary page, then click "submit"
> • Ignore any yellow banner alert—those things just love drama
>
> Pro tip: If you're also changing level, get manager confirmation and loop in Finance

## 📊 Impact

### For Hiring Managers:
- ✅ Self-service answers during intake
- ✅ No context-switching (stay in SmartIntake)
- ✅ Personality and humor (not boring docs)
- ✅ Instant, 24/7 availability

### For Recruiting Team:
- ✅ Fewer interruptions
- ✅ Consistent messaging
- ✅ Better hiring manager experience
- ✅ Scalable knowledge sharing

### For Everyone:
- ✅ Single source of truth (Glean Agent)
- ✅ Works in Slack AND SmartIntake
- ✅ Continuously improving (update agent, not code)

## 🎨 UI Preview

### SmartIntake AI:

```
┌─────────────────────────────────┐
│  SmartIntake Interface          │
│                                 │
│  [Job Description input...]     │
│                                 │
│                  ┌────────┐    │
│                  │  💬    │ ◄── Floating button
│                  └────────┘    │
└─────────────────────────────────┘

Click button →

┌────────────────────────────────────┐
│ ✨ Recruiting AI Assistant        │
│                                    │
│ ASK A QUESTION:                    │
│ ┌────────────────────────────────┐│
│ │ What makes a good competency?  ││
│ └────────────────────────────────┘│
│ [Ask Question]                     │
│                                    │
│ SUGGESTED QUESTIONS:               │
│ ○ How do I write a job desc?      │
│ ○ What's our leveling process?    │
│ ○ Tips for effective intake       │
└────────────────────────────────────┘
```

### Slack:

```
@RecruitingBot what's the lore about AI Research?

RecruitingBot:
Here's the real story—the "lore"—behind 
Handshake AI Research...
[Rich, personality-filled answer from Glean Agent]
```

## 📂 All Files

### SmartIntake AI:
- `src/lib/glean-client.ts` - Client library
- `src/app/api/glean/agent/route.ts` - API endpoint
- `src/components/GleanAssistant.tsx` - UI component
- `GLEAN-AGENT-INTEGRATION.md` - Full guide
- `HOW-TO-ADD-GLEAN-ASSISTANT.md` - Quick start
- `GLEAN-INTEGRATION-SUMMARY.md` - This file

### RecruitingBot:
- `glean-integration.js` - Client library
- `assistant-config.js` - Function definitions
- `index.js` - Handlers
- `GLEAN-AGENT-INTEGRATION.md` - Deployment guide
- `test-glean-agent.js` - Test script

## 🚀 Current Status

### ✅ Completed:
- Code integration (both projects)
- UI component (SmartIntake)
- API endpoints
- Documentation
- Test scripts

### ⏳ Pending:
- Glean API key
- Local testing
- Production deployment

## 🎁 Bonus Features

### Analytics (Future):
Track which questions are asked most frequently to:
- Identify documentation gaps
- Improve SmartIntake UX
- Create better onboarding

### Multi-turn Conversations (Future):
Allow follow-up questions:
```
User: "How do I level candidates?"
Agent: [Answer]
User: "What about for engineering roles specifically?"
Agent: [Contextual follow-up]
```

### Smart Suggestions (Future):
Based on hiring manager's progress:
- Viewing competencies → suggest competency questions
- Creating interview loop → suggest loop structure questions

## ❓ Questions?

**SmartIntake:** Check `HOW-TO-ADD-GLEAN-ASSISTANT.md`  
**RecruitingBot:** Check `../RecruitingBot-starter/GLEAN-AGENT-INTEGRATION.md`  
**Glean Agent:** https://joinhandshake.glean.com/chat/agents/058a5f966a1345aeb415ec5482e85594

---

**You're all set!** Once you have the Glean API key, both systems are ready to go! 🎉




