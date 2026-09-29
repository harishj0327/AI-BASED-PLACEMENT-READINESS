export interface PredictionRequest {
  cgpa: number;
  programming_skills: number;
  aptitude_score: number;
  communication_skills: number;
  technical_skills: number;
  projects_score: number;
  certifications: number;
  internship_experience: number;
}

export interface PredictionResponse {
  id?: string;
  score: number;
  category: 'Highly Ready' | 'Moderately Ready' | 'Needs Improvement' | 'Not Ready' | string;
  strengths: string[];
  skill_gaps: string[];
  recommendations: string[];
  model_name: string;
  feature_importance?: Record<string, number>;
  skill_analysis?: Record<string, number>;
  created_at?: string;
}

export interface PredictionRecord {
  id: string;
  userId: string;
  inputFeatures: PredictionRequest;
  score: number;
  category: string;
  strengths: string[];
  skillGaps: string[];
  recommendations: string[];
  modelName: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  college?: string;
  branch?: string;
  batch?: string;
  cgpa?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ModelMetricsItem {
  model_name: string;
  mae: number;
  rmse: number;
  r2: number;
}

export interface ModelMetricsResponse {
  active_model: string;
  selection_criterion: string;
  dataset_label: string;
  metrics_summary: ModelMetricsItem;
  comparison_table: Record<string, ModelMetricsItem>;
  feature_importance: Record<string, number>;
  dataset_size: number;
  train_samples: number;
  test_samples: number;
}

export interface DashboardStats {
  total_assessments: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  category_distribution: Record<string, number>;
  recent_trend: Array<{ date: string; score: number; category: string }>;
}

export interface DemoStudentPreset {
  profile: {
    name: string;
    email: string;
    college: string;
    branch: string;
    batch: string;
    cgpa: number;
  };
  features: PredictionRequest;
  prediction: PredictionResponse;
}
