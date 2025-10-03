export interface Intake {
  id: string;
  title: string;
  status: 'draft' | 'in_review' | 'approved' | 'published';
  
  // Basic info
  level?: string;
  job_title?: string;
  hiring_manager?: string;
  department?: string;
  job_description?: string;
  ashby_job_id?: string;
  
  // Structured data
  extracted_data?: any;
  org_context?: any;
  templates?: any;
  interview_loop?: any;
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  confluence_url?: string;
  search_text?: string;
}

export interface IntakeVersion {
  id: string;
  intake_id: string;
  version_number: number;
  data: any;
  changed_by: string;
  changed_at: string;
  change_summary?: string;
}

export interface IntakeComment {
  id: string;
  intake_id: string;
  user_email: string;
  user_name?: string;
  comment: string;
  section?: string;
  created_at: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

export interface IntakeApproval {
  id: string;
  intake_id: string;
  approver_email: string;
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
  responded_at?: string;
}

export interface IntakeActivity {
  id: string;
  intake_id: string;
  user_email: string;
  user_name?: string;
  action: string;
  details?: any;
  created_at: string;
}

export interface IntakeShare {
  id: string;
  intake_id: string;
  shared_with: string;
  permission: 'view' | 'edit' | 'approve';
  shared_by: string;
  created_at: string;
}

// Helper type for creating new intakes
export type NewIntake = Omit<Intake, 'id' | 'created_at' | 'updated_at'>;

// Helper type for updating intakes
export type IntakeUpdate = Partial<Omit<Intake, 'id' | 'created_by' | 'created_at'>>;

