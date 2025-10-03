# SignalMap

AI-powered recruiting intelligence platform. Map the signals that matter - build calibrated interview processes in minutes. Built with Next.js, TypeScript, and integrated with OpenAI, Ashby, and Confluence.

## 🎯 What It Does

SmartIntake AI transforms job descriptions into structured interview processes through an intelligent 7-step workflow:

1. **📝 Source**: Paste a job description or reference an Ashby Job ID
2. **🧠 Extract**: AI analyzes competencies, signals, and requirements  
3. **👥 Org Context**: Pulls team structure and cross-functional partners
4. **📋 Templates**: Matches existing interview templates and forms
5. **🎯 Synthesize**: Creates optimized interview loop with risk analysis
6. **📄 Publish**: Generates structured Confluence page with all details
7. **🚀 Push**: Applies interview plan directly to Ashby job

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI**: OpenAI GPT-4o (same assistant as RecruitingBot)
- **Integrations**: Ashby ATS, Confluence, Glean (optional)
- **Deployment**: Docker + Google Cloud Run

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker (for deployment)
- API keys for OpenAI, Ashby, and Confluence

### Local Development

1. **Clone and setup**:
   ```bash
   cd SmartIntake-AI
   chmod +x setup-env.sh && ./setup-env.sh
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: [http://localhost:3000](http://localhost:3000)

### Environment Configuration

Your credentials are already configured from RecruitingBot:
- ✅ **OpenAI API Key**: Same GPT-4o assistant with recruiting expertise
- ✅ **Ashby API Key**: Full read/write access to jobs and interview plans  
- ✅ **Confluence**: Access to IRT space with publishing permissions
- 🔄 **Glean**: Optional for org context (add your own key)

## 🏗️ Architecture

### API Routes
- `/api/openai/extract` - Job description analysis
- `/api/openai/synthesize` - Interview loop generation
- `/api/glean/org` - Organization context lookup
- `/api/templates/match` - Template and form matching
- `/api/confluence/publish` - Structured page creation
- `/api/ashby/push` - Interview plan deployment

### Key Features
- **🎯 Intelligent Analysis**: Uses same AI as RecruitingBot with recruiting expertise
- **📊 Risk Assessment**: Identifies process gaps and time overruns
- **🔗 Template Matching**: Finds relevant forms from Confluence and Ashby
- **👥 Org Integration**: Suggests interviewers based on team structure
- **📝 Structured Output**: Creates searchable Confluence pages with embedded JSON
- **⚡ One-Click Deploy**: Pushes complete interview plans to Ashby

## 🚢 Deployment

### Docker Build
```bash
# Build image
docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/handshake-data-playground/ml-infrastructure/smartintake-ai:latest .

# Push to registry
docker push us-central1-docker.pkg.dev/handshake-data-playground/ml-infrastructure/smartintake-ai:latest
```

### Google Cloud Run
```bash
# Deploy via YAML
gcloud run services replace cloud-run-service.yaml --region=us-central1

# Or deploy directly
gcloud run deploy smartintake-ai \
  --image=us-central1-docker.pkg.dev/handshake-data-playground/ml-infrastructure/smartintake-ai:latest \
  --region=us-central1 \
  --platform=managed
```

## 🔐 Security

- **Environment Variables**: All secrets stored in Google Secret Manager
- **Authentication**: Ready for Google SSO integration
- **HTTPS Only**: Enforced in production
- **Security Headers**: XSS and frame protection enabled
- **API Validation**: Input sanitization on all endpoints

## 🎯 Integration with RecruitingBot

SmartIntake AI works perfectly alongside your RecruitingBot:

| **SmartIntake AI** | **RecruitingBot** |
|-------------------|-------------------|
| ✅ Creates interview processes | ✅ Answers daily recruiting questions |
| ✅ Proactive workflow automation | ✅ Reactive conversational assistance |
| ✅ Structured job setup | ✅ Knowledge search and guidance |
| ✅ Process design focus | ✅ Day-to-day support focus |

**Perfect Workflow**:
1. Use SmartIntake AI to design interview process
2. Process gets published to Confluence with proper labels
3. RecruitingBot can find and reference that process
4. Team uses both tools in their complementary roles

## 📊 Example Output

For a "Senior Product Designer" role, SmartIntake AI generates:

- **🎯 5-stage interview loop** (240 minutes total)
- **📋 Competency mapping** (Craft, Collaboration, Execution, etc.)  
- **👥 Interviewer suggestions** based on org chart
- **⚠️ Risk analysis** (time overrun, signal overlap)
- **📄 Confluence page** with structured documentation
- **🔗 Ashby integration** with interview stages and forms

## 🔧 Customization

- **Templates**: Add your own interview templates in Confluence
- **Competencies**: Customize the AI prompt for your company values
- **Org Integration**: Connect to your HRIS for better team suggestions
- **Branding**: Update UI components to match your design system

## 🤝 Support

Built by the same team that created RecruitingBot. Uses proven patterns from your existing recruiting AI infrastructure.

---

**SmartIntake AI**: Transform job descriptions into optimized interview processes in minutes, not hours. 🚀








