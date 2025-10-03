# 🎨 SmartIntake AI - Redesigned Flow

## What Changed

Redesigned the intake flow to be more **sequential and guided**, collecting context **before** the job description.

## New Flow

### Step 1: Setup - Basic Context 🟣
**Collect essential info first:**

1. **Level** (Required)
   - IC levels: L1-L9
   - Management: M3-M5
   - Visual selector with clear labels

2. **Hiring Manager** (Required) 
   - ✨ **Glean-powered lookup!**
   - User types name → clicks "Lookup" button
   - Auto-fills: Title, Department, Team members
   - Beautiful gradient button with Sparkles icon
   - Shows success state with green checkmark when loaded

3. **Job Title** (Required)
   - e.g., "Senior Product Designer", "Staff Engineer"
   - Used for Confluence page name

4. **Ashby Job URL** (Optional)
   - Auto-extracts ID from full URL
   - Or paste just the ID

**Visual Design:**
- Purple gradient background (from-purple-50 to-blue-50)
- Numbered badge (1) in purple
- Validation message if fields incomplete
- Fields disabled until previous required fields filled

---

### Step 2: Job Description 🔵
**Add the JD once context is set:**

- Large textarea (h-48)
- **Disabled until Step 1 is complete**
- Buttons:
  - Sample JD (loads example)
  - Analyze JD (processes with AI)
  - Enhance JD (improves writing)

**Visual Design:**
- Blue numbered badge (2)
- Clean, simple layout
- Clear that it comes after Step 1

---

### Step 3: Review & Edit Extracted Data 🟢
**AI-extracted requirements:**

- Shows empty state if no data yet
- Displays:
  - Level & Function
  - Must-haves & Nice-to-haves
  - Competencies (editable)
  - Risks

**Visual Design:**
- Green numbered badge (3)
- Shows Sparkles icon in empty state

---

## Key Features

### Glean-Powered Hiring Manager Lookup

**Before filling in:**
```
┌──────────────────────────────────────────┐
│ [Enter hiring manager name... ] [Lookup] │
│ ✨ Powered by Glean - will auto-fill     │
│    title, department, and team info      │
└──────────────────────────────────────────┘
```

**After loading:**
```
┌────────────────────────────────────────┐
│ ✅ Manager Info Loaded        [Edit]   │
│                                        │
│ Manager: Sarah Johnson                 │
│ Department: Product Engineering        │
│ Team: [Alex Chen] [Jordan Kim]        │
│      [Taylor Smith]                    │
└────────────────────────────────────────┘
```
- Green gradient background
- Visual confirmation with checkmark
- Clean badge display for team members

### Progressive Disclosure

Fields are **disabled until prerequisites are met**:

1. Can't add JD until Step 1 fields are filled
2. Warning message shows if trying to skip ahead
3. Clear visual feedback (disabled states, validation messages)

### Smart Validation

```
⚠️ Please complete all required fields above before adding job description
```
- Shows when Step 1 incomplete
- Amber background for visibility
- Guides user to correct order

---

## Benefits

### For Users:
✅ **Clear path forward** - Numbered steps, no confusion  
✅ **Glean magic** - Auto-fill manager info  
✅ **Can't skip steps** - Progressive validation  
✅ **Better context** - AI analysis uses manager info  

### For AI:
✅ **More context earlier** - Better analysis  
✅ **Manager-aware** - Can tailor suggestions  
✅ **Level-appropriate** - Knows seniority upfront  

### For UX:
✅ **Beautiful** - Gradient badges, clear hierarchy  
✅ **Guided** - Step-by-step flow  
✅ **Feedback** - Success states, validation  
✅ **Modern** - Framer Motion ready, clean design  

---

## Technical Implementation

### Files Modified:

1. **`src/components/SmartIntake.tsx`**
   - Restructured main form layout
   - Added numbered step badges
   - Conditional disabling of fields
   - Validation messages

2. **`src/components/EditableSection.tsx`**
   - Enhanced hiring manager lookup UI
   - Added Glean branding ("Powered by Glean")
   - Success state with green gradient
   - Sparkles icon on lookup button
   - Enter key support

### New Features:

```tsx
// Hiring Manager Lookup (when empty)
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
  />
  <Button 
    onClick={pullFromHM}
    className="bg-gradient-to-r from-purple-600 to-blue-600"
  >
    <Sparkles className="w-4 h-4 mr-2" />
    Lookup
  </Button>
</div>
```

### Validation Logic:

```tsx
// Step 2 (JD) disabled until Step 1 complete
disabled={!level || !org?.manager || !jobTitle}

// Analyze button requires all context
disabled={!jd || !level || !org?.manager || !jobTitle || !!busy}
```

---

## Future Enhancements (When Glean API Key Available)

### Real Glean Lookup:
Once you have the Glean API key, the hiring manager lookup will:
1. Query Glean for the person
2. Extract:
   - Full name
   - Title
   - Department
   - Direct reports (team members)
   - Cross-functional collaborators
3. Auto-populate all fields

### Enhanced with Glean Agent:
Could also ask Glean Agent:
- "What projects is [Manager] working on?"
- "What's [Manager]'s management style?"
- "Recent hires on [Manager]'s team?"

---

## Visual Hierarchy

### Color Coding:
- 🟣 **Purple** - Step 1 (Setup/Input)
- 🔵 **Blue** - Step 2 (Content)
- 🟢 **Green** - Step 3 (Review)

### Icons:
- ✨ **Sparkles** - AI/Magic (Glean lookup, AI analysis)
- ✅ **CheckCircle** - Success/Completion
- 📝 **Edit** - Modify/Change
- ⚠️ **Warning** - Validation/Required

### Spacing:
- Generous padding in Step 1 (most important)
- Clear separation between steps
- Numbered badges for visual progression

---

## Testing Checklist

- [ ] Level selector works
- [ ] Hiring manager lookup calls Glean API
- [ ] Auto-populated data displays correctly
- [ ] JD textarea disabled until Step 1 complete
- [ ] Validation messages show appropriately
- [ ] Edit functionality works on loaded manager data
- [ ] Analyze button respects all requirements
- [ ] Visual states (disabled, success, warning) display correctly
- [ ] Responsive on mobile (grid collapses)

---

## Next Steps

1. **Get Glean API Key** - For real hiring manager lookup
2. **Test locally** - Verify flow and UX
3. **Deploy** - Push to Cloud Run
4. **Gather feedback** - See how users respond to new flow

---

## Screenshots (Conceptual)

### Step 1 - Empty State:
```
┌─────────────────────────────────────────────────┐
│ (1) Setup: Basic Context                       │
│                                                 │
│ Level *       Hiring Manager *                  │
│ [L3 ▼]        [Enter name...] [🌟 Lookup]      │
│               ✨ Powered by Glean               │
│                                                 │
│ Job Title *                                     │
│ [Senior Product Designer]                       │
│                                                 │
│ ⚠️ Please complete all required fields         │
└─────────────────────────────────────────────────┘
```

### Step 1 - Filled:
```
┌─────────────────────────────────────────────────┐
│ (1) Setup: Basic Context                       │
│                                                 │
│ Level: L5                                       │
│                                                 │
│ ✅ Manager Info Loaded              [Edit]     │
│ Manager: Sarah Johnson                          │
│ Department: Product Engineering                 │
│ Team: [Alex] [Jordan] [Taylor]                  │
│                                                 │
│ Job Title: Senior Product Designer              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ (2) Job Description                             │
│                                                 │
│ [Large textarea with JD content...]             │
│ [Sample JD] [✨ Analyze JD] [Enhance JD]       │
└─────────────────────────────────────────────────┘
```

---

**Ready to test once you have the Glean API key!** 🚀

