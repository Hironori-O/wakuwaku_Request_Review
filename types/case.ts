export interface CaseData {
  id: string;
  basic_info: {
    person_name: string;
    company_name: string;
    address: string;
    phone: string;
    position: string;
    writer_name: string;
    relationship: string;
    work_type: string;
    work_hours: string;
    hire_date: string;
    department: string;
    daily_work_hours: string;
    weekly_work_days: string;
  };
  disability_status: {
    lateness: string;
    early_leaving: string;
    sudden_absence: string;
    leaving_during_work: string;
    communication: string;
    work_capability?: string[];
    work_performance?: string[];
    [key: string]: any;
  };
  considerations: {
    physical_environment?: string[];
    work_considerations?: string[];
    communication_support?: string[];
    human_support?: string[];
    health_safety?: string[];
    career_development?: string[];
    mental_support?: string[];
    [key: string]: string[] | undefined;
  };
  episode: string;
}

export interface Hashtag {
  id: string;
  text: string;
} 