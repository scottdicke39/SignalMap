-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Intakes table (main documents)
CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_review, approved, published
  
  -- Basic info
  level VARCHAR(10),
  job_title VARCHAR(255),
  hiring_manager VARCHAR(255),
  department VARCHAR(255),
  job_description TEXT,
  ashby_job_id VARCHAR(255),
  
  -- Structured data (JSON)
  extracted_data JSONB,
  org_context JSONB,
  templates JSONB,
  interview_loop JSONB,
  
  -- Metadata
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  confluence_url VARCHAR(500),
  
  -- Search
  search_text TEXT
);

-- Version history
CREATE TABLE IF NOT EXISTS intake_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  changed_by VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_summary TEXT
);

-- Comments
CREATE TABLE IF NOT EXISTS intake_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  comment TEXT NOT NULL,
  section VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Approvals
CREATE TABLE IF NOT EXISTS intake_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  approver_email VARCHAR(255) NOT NULL,
  approver_name VARCHAR(255),
  status VARCHAR(50), -- pending, approved, rejected
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Activity log
CREATE TABLE IF NOT EXISTS intake_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sharing/Permissions
CREATE TABLE IF NOT EXISTS intake_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE,
  shared_with VARCHAR(255) NOT NULL,
  permission VARCHAR(50) DEFAULT 'view', -- view, edit, approve
  shared_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_intakes_created_by ON intakes(created_by);
CREATE INDEX IF NOT EXISTS idx_intakes_status ON intakes(status);
CREATE INDEX IF NOT EXISTS idx_intakes_hiring_manager ON intakes(hiring_manager);
CREATE INDEX IF NOT EXISTS idx_intakes_created_at ON intakes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_shares_shared_with ON intake_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_intake_comments_intake_id ON intake_comments(intake_id);
CREATE INDEX IF NOT EXISTS idx_intake_activity_intake_id ON intake_activity(intake_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_intakes_updated_at BEFORE UPDATE ON intakes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_shares ENABLE ROW LEVEL SECURITY;

-- Policies for intakes
-- Users can see their own intakes
CREATE POLICY "Users can view own intakes" ON intakes
  FOR SELECT USING (created_by = current_user);

-- Users can view intakes shared with them
CREATE POLICY "Users can view shared intakes" ON intakes
  FOR SELECT USING (
    id IN (
      SELECT intake_id FROM intake_shares 
      WHERE shared_with = current_user
    )
  );

-- Users can insert their own intakes
CREATE POLICY "Users can create intakes" ON intakes
  FOR INSERT WITH CHECK (created_by = current_user);

-- Users can update their own intakes
CREATE POLICY "Users can update own intakes" ON intakes
  FOR UPDATE USING (created_by = current_user);

-- Users with edit permission can update shared intakes
CREATE POLICY "Users can update shared intakes with edit permission" ON intakes
  FOR UPDATE USING (
    id IN (
      SELECT intake_id FROM intake_shares 
      WHERE shared_with = current_user 
      AND permission IN ('edit', 'approve')
    )
  );

-- Users can delete their own intakes
CREATE POLICY "Users can delete own intakes" ON intakes
  FOR DELETE USING (created_by = current_user);

-- Policies for comments
CREATE POLICY "Users can view comments on accessible intakes" ON intake_comments
  FOR SELECT USING (
    intake_id IN (
      SELECT id FROM intakes WHERE created_by = current_user
      UNION
      SELECT intake_id FROM intake_shares WHERE shared_with = current_user
    )
  );

CREATE POLICY "Users can create comments on accessible intakes" ON intake_comments
  FOR INSERT WITH CHECK (
    intake_id IN (
      SELECT id FROM intakes WHERE created_by = current_user
      UNION
      SELECT intake_id FROM intake_shares WHERE shared_with = current_user
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Users can view activity on accessible intakes" ON intake_activity
  FOR SELECT USING (
    intake_id IN (
      SELECT id FROM intakes WHERE created_by = current_user
      UNION
      SELECT intake_id FROM intake_shares WHERE shared_with = current_user
    )
  );

