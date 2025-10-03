# 🚀 How to Add Glean Assistant to SmartIntake AI

## Quick Start (2 minutes)

### Step 1: Import the Component

In `src/components/SmartIntake.tsx`, add this import at the top:

```tsx
import GleanAssistant from "./GleanAssistant";
```

### Step 2: Add to JSX

At the end of your SmartIntake component's return statement, add:

```tsx
export default function SmartIntake() {
  // ... existing code ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ... existing JSX ... */}
      
      {/* Add this at the very end, before closing </div> */}
      <GleanAssistant />
    </div>
  );
}
```

### Step 3: Test It!

```bash
npm run dev
```

Open http://localhost:3000 and you'll see a floating button in the bottom-right corner! 🎉

## Customization

### Context-Aware Suggestions

Change suggestions based on what section the user is in:

```tsx
// Define suggestion sets
const suggestionsBySection = {
  'jd-input': [
    "What should I include in a job description?",
    "How do I write clear requirements?",
    "What's the difference between must-haves and nice-to-haves?"
  ],
  'competencies': [
    "What makes a good competency?",
    "How many competencies should I have?",
    "Give me examples of technical competencies"
  ],
  'interview-loop': [
    "How long should each interview be?",
    "Who should be on my interview panel?",
    "What's the ideal interview loop structure?"
  ]
};

// Track current section
const [currentSection, setCurrentSection] = useState('jd-input');

// Pass to GleanAssistant
<GleanAssistant 
  suggestedQuestions={suggestionsBySection[currentSection]}
  currentSection={currentSection}
/>
```

### Custom Styling

The component uses Tailwind and your existing UI components, so it matches your design system automatically!

To customize colors, edit `src/components/GleanAssistant.tsx`:

```tsx
// Change gradient colors
className="bg-gradient-to-r from-purple-600 to-blue-600"
// to
className="bg-gradient-to-r from-green-600 to-teal-600"
```

## What's Included

✅ **Floating button** - Always accessible, doesn't block content  
✅ **Smooth animations** - Framer Motion transitions  
✅ **Suggested questions** - Help users know what to ask  
✅ **Error handling** - Graceful fallbacks if Glean unavailable  
✅ **Loading states** - Clear feedback while thinking  
✅ **Keyboard support** - Enter to submit  
✅ **Responsive** - Works on mobile  

## Example Usage

**Hiring Manager asks:** "How do I level a candidate?"

**Glean Agent responds:**
> Here's the real approach to leveling at Handshake:
> 
> 1. Start with the competencies and signals you defined
> 2. Match candidate performance to our leveling framework
> 3. Consider scope of work, autonomy, and impact
> 4. Ask yourself: "What level of work can they own on day 1?"
> 
> Pro tip: When in doubt, hire for the level they can hit the ground running at, not the potential level. You can always promote faster than you can course-correct.

## API Key Required

Remember to add your Glean API key once you have it:

```bash
# Add to .env.local
GLEAN_API_KEY=your-key-here
```

Without the API key, the component will show a friendly error message.

## Files Modified

- ✅ `src/lib/glean-client.ts` - Added `askRecruitingAgent()` method
- ✅ `src/app/api/glean/agent/route.ts` - New API endpoint
- ✅ `src/components/GleanAssistant.tsx` - New UI component

## Questions?

Check `GLEAN-AGENT-INTEGRATION.md` for full documentation!




