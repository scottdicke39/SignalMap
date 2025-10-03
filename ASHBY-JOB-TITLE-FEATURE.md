# 🎯 Ashby Job Title Search Feature

## ✨ What's New

You can now search for jobs in Ashby by **job title** instead of needing the exact Job ID!

## 🚀 How It Works

### **Two Scenarios:**

#### **1. ✅ Job Found in Ashby**
1. Enter job title (e.g., "Senior Operations Manager")
2. Click "Search" button
3. System searches Ashby for matching open jobs
4. If found:
   - ✅ Job description auto-loads into JD field
   - ✅ Ashby Job ID is captured
   - ✅ Job title is saved for Confluence page

#### **2. ℹ️ Job Not Found in Ashby**
1. Enter job title (e.g., "AI Research Scientist")
2. Click "Search" button
3. System searches Ashby but doesn't find match
4. Job title is still saved and used for:
   - ✅ Confluence page title
   - ✅ Interview planning context

---

## 📋 UI Changes

### **Before:**
```
┌────────────────────────────────────┐
│ Job Description                    │
│ [Paste JD here...]                 │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ Or: Ashby Job ID                   │
│ [job_abc123]          [Fetch]      │
└────────────────────────────────────┘
```

### **After:**
```
┌────────────────────────────────────┐
│ Job Description                    │
│ [Paste JD here...]                 │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ Or: Job Title (Search Ashby)       │
│ [Senior Operations Manager] [🔍]   │
│ Searches Ashby by title...         │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ Or: Ashby Job ID                   │
│ [job_abc123]                       │
│ Direct job ID if you have it.      │
└────────────────────────────────────┘
```

---

## 💡 Example Workflows

### **Workflow 1: Search Ashby by Title**
```
1. Enter: "Senior Operations Manager"
2. Click "Search"
3. ✅ Found: Loads full JD from Ashby
4. Select Level: L4
5. Enter hiring manager & department
6. Click "Analyze JD"
7. Generate interview loop
8. Publish to Confluence
   → Title: "INTAKE – L4 Senior Operations Manager – 2025-10-01"
```

### **Workflow 2: Title Not in Ashby (But Still Use It)**
```
1. Enter: "AI Research Scientist"
2. Click "Search"
3. ℹ️  Not found in Ashby
4. Manually paste JD
5. Select Level: L5
6. Enter hiring manager & department
7. Click "Analyze JD"
8. Generate interview loop
9. Publish to Confluence
   → Title: "INTAKE – L5 AI Research Scientist – 2025-10-01"
```

### **Workflow 3: Direct Job ID (Old Method Still Works)**
```
1. Enter Ashby Job ID: "job_abc123"
2. (Skip title search)
3. Paste or fetch JD
4. Continue as normal...
```

---

## 🔍 Search Algorithm

### **How Matching Works:**
- **Case-insensitive** search
- **Partial matching** (searches within title)
- Only searches **open jobs** in Ashby

### **Examples:**
| Your Input | Ashby Job Title | Match? |
|------------|-----------------|--------|
| "operations manager" | "Senior Operations Manager" | ✅ Yes |
| "ops" | "Operations Specialist" | ✅ Yes |
| "senior ops" | "Senior Operations Manager" | ✅ Yes |
| "engineer" | "Senior Software Engineer" | ✅ Yes |
| "product" | "Product Manager" | ✅ Yes |
| "xyz123" | "Operations Manager" | ❌ No |

---

## 📄 Confluence Page Title

### **Priority:**
1. **Job Title** (if provided) ← NEW!
2. **Function** (from department)
3. **"Role"** (fallback)

### **Format:**
```
INTAKE – {Level} {JobTitle/Function} – {Date}
```

### **Examples:**
```
✅ INTAKE – L4 Senior Operations Manager – 2025-10-01
✅ INTAKE – M3 Engineering Manager – 2025-10-01
✅ INTAKE – L5 AI Research Scientist – 2025-10-01
✅ INTAKE – L6 Staff Software Engineer – 2025-10-01
```

---

## 🛠️ Technical Details

### **New API Endpoint:**
`POST /api/ashby/search-job`

**Request:**
```json
{
  "jobTitle": "Senior Operations Manager"
}
```

**Response (Found):**
```json
{
  "job": {
    "id": "job_abc123",
    "title": "Senior Operations Manager",
    "description": "Full job description...",
    "department": "Operations",
    "location": "Remote"
  }
}
```

**Response (Not Found):**
```json
{
  "job": null,
  "message": "No job found matching \"AI Research Scientist\"",
  "availableJobs": ["Software Engineer", "Product Manager", ...]
}
```

### **Files Modified:**
1. **`SmartIntake.tsx`**
   - Added `jobTitle` state
   - Added `fetchFromAshbyByTitle()` function
   - Updated UI with job title field
   - Passes `jobTitle` to publish

2. **`src/app/api/ashby/search-job/route.ts` (NEW)**
   - Searches Ashby jobs by title
   - Fetches full job details if found
   - Returns available jobs for reference

3. **`src/app/api/confluence/publish/route.ts`**
   - Accepts `jobTitle` parameter
   - Uses `jobTitle` in page title generation
   - Falls back to function if no title

---

## 🧪 Testing Guide

### **Test 1: Search Existing Job**
1. Go to http://localhost:3000
2. In Source section, enter job title: "Senior Operations"
3. Click "Search"
4. ✅ Should find job and load JD
5. ✅ Job ID should populate
6. ✅ Title should be saved

### **Test 2: Search Non-Existent Job**
1. Enter job title: "Quantum Physicist"
2. Click "Search"
3. ℹ️  Should show "not found" message
4. ✅ Title should still be saved
5. Paste JD manually
6. Continue to Confluence publish
7. ✅ Title should appear in Confluence page name

### **Test 3: Confluence Page Title**
1. Complete interview intake (any method)
2. Publish to Confluence
3. Check Confluence page title
4. ✅ Should show: "INTAKE – {Level} {JobTitle} – {Date}"
5. ✅ JobTitle should match what you entered

### **Test 4: Backward Compatibility**
1. Use old method (paste JD, no title)
2. Set level & department
3. Publish
4. ✅ Should use department as title
5. ✅ Should still work as before

---

## 💡 Benefits

### **For Recruiters:**
- ✅ **Faster**: No need to find Job ID
- ✅ **Easier**: Just type the role name
- ✅ **Flexible**: Works even if job not in Ashby
- ✅ **Accurate**: Correct titles in all pages

### **For Hiring Managers:**
- ✅ **Clear Titles**: Confluence pages are properly labeled
- ✅ **Consistent**: All intake docs use same naming

### **For Operations:**
- ✅ **Searchable**: Easy to find intakes by job title
- ✅ **Organized**: Better Confluence page organization

---

## 🚀 Ready to Use!

**Refresh http://localhost:3000** and try:

1. Enter a job title you know exists in Ashby
2. Click "Search"
3. Watch it load the JD automatically!

Or try a custom role that's not in Ashby yet and see how the title still gets used for Confluence!

---

**Status:** ✅ Fully implemented and ready for testing!

