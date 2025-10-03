# 🚀 SmartIntake AI - Full Platform Implementation Plan

## Vision
Transform SmartIntake from a single-session tool into a **collaborative hiring platform** where teams can create, share, iterate, and approve intake documents together.

---

## Phase 1: Foundation (Now - 2 hours)

### Database Schema
```sql
-- Intakes (main documents)
CREATE TABLE intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_review, approved, published
  
  -- Data fields
  level VARCHAR(10),
  job_title VARCHAR(255),
  hiring_manager VARCHAR(255),
  department VARCHAR(255),
  job_description TEXT,
  ashby_job_id VARCHAR(255),
  
  -- Extracted data (JSON)
  extracted_data JSONB,
  org_context JSONB,
  templates JSONB,
  interview_loop JSONB,
  
  -- Metadata
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  confluence_url VARCHAR(500),
  
  -- Search
  search_vector tsvector
);

-- Version History
CREATE TABLE intake_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  changed_by VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  change_summary TEXT
);

-- Comments
CREATE TABLE intake_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  comment TEXT NOT NULL,
  section VARCHAR(100), -- which part they're commenting on
  created_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Approvals
CREATE TABLE intake_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  approver_email VARCHAR(255) NOT NULL,
  approver_name VARCHAR(255),
  status VARCHAR(50), -- pending, approved, rejected
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Log
CREATE TABLE intake_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL, -- created, edited, commented, approved, published
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sharing/Permissions
CREATE TABLE intake_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  shared_with VARCHAR(255) NOT NULL, -- email or team
  permission VARCHAR(50) DEFAULT 'view', -- view, edit, approve
  shared_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tech Stack
- **Database**: Supabase (PostgreSQL + real-time + auth built-in)
- **Auth**: Supabase Auth (email-based or SSO)
- **Real-time**: Supabase real-time subscriptions
- **Storage**: Supabase storage for attachments (future)
- **Deployment**: Vercel (already set up)

---

## Phase 2: Core Features (2-3 hours)

### 1. Authentication
```typescript
// Simple email-based auth with Supabase
- Sign up / Sign in
- Google OAuth (if available)
- Session management
- User profile
```

### 2. Dashboard Page
```
/dashboard
├── My Intakes (created by me)
├── Shared with Me
├── All Intakes (for admins)
└── Templates
```

**Features:**
- List view with filters (status, hiring manager, date)
- Search by title, hiring manager, job title
- Quick actions (edit, duplicate, share, delete)
- Status badges (draft, in review, approved, published)
- Last edited timestamp

### 3. Save/Load/Auto-save
```typescript
// Auto-save every 30 seconds
// Manual save button
// Version snapshots
// Conflict resolution
```

### 4. Sharing & Permissions
```typescript
// Share modal
- Enter email addresses
- Set permission level (view, edit, approve)
- Generate shareable link
- Revoke access
```

---

## Phase 3: Collaboration (3-4 hours)

### 1. Real-time Co-editing
```typescript
// Show who's viewing/editing
// Live cursor positions (optional)
// Lock editing conflicts
// Presence indicators
```

### 2. Comments & Discussion
```typescript
// Inline comments on sections
// Reply threads
// Mentions (@user)
// Resolve/unresolve
// Email notifications
```

### 3. Approval Workflow
```typescript
// Request approval from hiring manager
// Approval status tracking
// Approval comments/feedback
// Email notifications
// Conditional publishing (must be approved)
```

### 4. Activity Feed
```typescript
// See all changes
// Filter by user/action
// Timeline view
// Export activity log
```

---

## Phase 4: Advanced Features (4-5 hours)

### 1. Templates
```typescript
// Save intake as template
// Browse template library
// Clone from template
// Share templates with team
```

### 2. Bulk Operations
```typescript
// Duplicate multiple intakes
// Batch status updates
// Export to CSV
// Archive old intakes
```

### 3. Analytics
```typescript
// Time to completion
// Most used templates
// Approval times
// User activity
```

### 4. Notifications
```typescript
// Email notifications
// In-app notifications
// Slack integration (future)
```

---

## UI/UX Flow

### Dashboard View
```
┌─────────────────────────────────────────────────────┐
│ 🌟 SmartIntake AI                    [@Scott ▼]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [+ New Intake]  [Templates]  [Search...]          │
│                                                     │
│  My Intakes (12)                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │ Senior Product Designer                      │  │
│  │ Sarah Johnson · Engineering · L5             │  │
│  │ 🟡 In Review · Updated 2h ago               │  │
│  │ [Edit] [Share] [View]                       │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ Staff Engineer, AI Research                  │  │
│  │ Alex Chen · AI Research · L6                 │  │
│  │ ✅ Approved · Published to Confluence       │  │
│  │ [View] [Duplicate]                          │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Shared with Me (3)                                │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

### Intake Editor (Enhanced)
```
┌─────────────────────────────────────────────────────┐
│ Staff Engineer, AI Research                         │
│ 💾 Saved 2 min ago  👥 2 viewing  [Share] [•••]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Step 1: Setup]                                     │
│ ...                                                 │
│                                                     │
│ 💬 2 comments    [Resolve All]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Share Modal
```
┌─────────────────────────────────────┐
│ Share "Staff Engineer, AI Research" │
│                                     │
│ Add people:                         │
│ [email@joinhandshake.com      ]    │
│ [Can edit ▼]  [Send]               │
│                                     │
│ People with access:                 │
│ • Sarah Johnson (Owner)             │
│ • Alex Chen (Can edit)              │
│ • Jamie Lee (Can view)              │
│                                     │
│ [Copy link]  [Done]                 │
└─────────────────────────────────────┘
```

---

## Implementation Steps (Today)

### Step 1: Set up Supabase (15 min)
```bash
# Initialize Supabase project
npx supabase init
npx supabase start

# Create tables
# Configure auth
# Set up Row Level Security (RLS)
```

### Step 2: Create Database Schema (30 min)
```sql
-- Run migration files
-- Set up RLS policies
-- Create indexes
-- Add triggers for updated_at
```

### Step 3: Add Auth (30 min)
```typescript
// Install Supabase client
// Create auth context
// Add login/signup pages
// Protect routes
```

### Step 4: Build Dashboard (1 hour)
```typescript
// Create /dashboard page
// List intakes from DB
// Add filters and search
// Quick actions (edit, duplicate, delete)
```

### Step 5: Save/Load in SmartIntake (1 hour)
```typescript
// Auto-save functionality
// Load intake by ID
// Update existing intake
// Create new intake
```

### Step 6: Deploy (15 min)
```bash
# Update environment variables
# Deploy to Vercel
# Configure Supabase connection
```

---

## Future Enhancements

### Phase 5: Power Features
- **AI Suggestions**: "This role might need a design exercise"
- **Benchmark Data**: "Similar roles have 4-5 interview rounds"
- **Integration Hub**: Connect to other tools
- **Mobile App**: React Native version
- **Slack Bot**: Create intakes from Slack
- **Calendar Sync**: Interview scheduling
- **Candidate Portal**: Let candidates see their process

---

## Success Metrics

### For Recruiting Team:
- ✅ Time saved per intake
- ✅ Collaboration efficiency
- ✅ Approval cycle time
- ✅ Template reuse rate

### For Hiring Managers:
- ✅ Clarity on process
- ✅ Ease of collaboration
- ✅ Quality of interview plans
- ✅ Confidence in hiring decisions

---

## Let's Get Started! 🚀

Ready to build this? I'll start with:
1. Supabase setup
2. Database schema
3. Basic authentication
4. Dashboard page
5. Save/load functionality

Should take 2-3 hours for the foundation, then we can iterate!

