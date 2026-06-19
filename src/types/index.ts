export interface Profile {
  id: string;
  full_name: string;
  email: string;
  job_preference: string;
  location: string;
  cv_url?: string;
  generated_cv_url?: string;
  profile_summary?: string;
  created_at: string;
}

export interface Job {
  job_id: string;
  company: string;
  role: string;
  apply_link: string;
  location: string;
  tags?: string[];
  description?: string;
  created_at?: string;
}

export interface MatchedJob extends Job {
  match_score: number;
  matched_at: string;
}

export interface AuthFormData {
  full_name?: string;
  email: string;
  job_preference?: string;
  location?: string;
  password: string;
  confirm_password?: string;
}

export interface UploadResponse {
  success: boolean;
  cv_url?: string;
  error?: string;
}

export interface MatchedJobsResponse {
  success: boolean;
  jobs?: MatchedJob[];
  error?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
