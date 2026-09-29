import {
  PredictionRequest,
  PredictionResponse,
  PredictionRecord,
  UserProfile,
  ModelMetricsResponse,
  DashboardStats,
  DemoStudentPreset,
} from '../types';
import { getCachedUser } from '../lib/firebase';

const API_BASE = '/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const user = getCachedUser();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (user?.token) {
    headers.set('Authorization', `Bearer ${user.token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.detail || errJson.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // ML Inference
  async predict(data: PredictionRequest): Promise<PredictionResponse> {
    return fetchWithAuth('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Save prediction to Firestore
  async savePrediction(
    inputFeatures: PredictionRequest,
    predictionData: PredictionResponse
  ): Promise<{ status: string; data: PredictionRecord }> {
    const user = getCachedUser();
    return fetchWithAuth('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        input_features: inputFeatures,
        prediction_data: predictionData,
        user_id: user?.uid,
      }),
    });
  },

  // Fetch prediction history
  async getHistory(): Promise<{ history: PredictionRecord[]; count: number }> {
    return fetchWithAuth('/predictions/history');
  },

  // Analytics dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    return fetchWithAuth('/dashboard/stats');
  },

  // Model comparison & explainability
  async getModelMetrics(): Promise<ModelMetricsResponse> {
    return fetchWithAuth('/model/metrics');
  },

  // Model info
  async getModelInfo(): Promise<any> {
    return fetchWithAuth('/model/info');
  },

  // Student Profile
  async getProfile(): Promise<UserProfile> {
    return fetchWithAuth('/profile');
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return fetchWithAuth('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Live Demo Presets
  async getDemoStudents(): Promise<{ students: DemoStudentPreset[] }> {
    return fetchWithAuth('/demo/students');
  },
};
