export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'manager' | 'developer' | 'client';
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  domain: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type FeatureRequest = {
  id: string;
  title: string;
  description: string | null;
  client_id: string;
  project_id: string | null;
  status: 'new' | 'under_review' | 'approved' | 'in_development' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: string | null;
  submitted_at: string;
  updated_at: string;
};

export type SupportTicket = {
  id: string;
  title: string;
  description: string | null;
  client_id: string;
  project_id: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: string | null;
  assigned_to: string | null;
  submitted_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any> | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      feature_requests: {
        Row: FeatureRequest;
        Insert: Omit<FeatureRequest, 'id' | 'submitted_at' | 'updated_at'>;
        Update: Partial<Omit<FeatureRequest, 'id' | 'submitted_at' | 'updated_at'>>;
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: Omit<SupportTicket, 'id' | 'submitted_at' | 'updated_at'>;
        Update: Partial<Omit<SupportTicket, 'id' | 'submitted_at' | 'updated_at'>>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>;
      };
    };
  };
}; 