/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultPage } from './pages/ResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';

import { AuthUser, getCachedUser, logoutUser } from './lib/firebase';
import {
  PredictionRequest,
  PredictionResponse,
  PredictionRecord,
  DemoStudentPreset,
} from './types';
import { api } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [demoStudents, setDemoStudents] = useState<DemoStudentPreset[]>([]);

  // Assessment & Result state
  const [activePrediction, setActivePrediction] = useState<PredictionResponse | null>(null);
  const [activeInputs, setActiveInputs] = useState<PredictionRequest | null>(null);

  // Initialize cached user & demo presets
  useEffect(() => {
    const cached = getCachedUser();
    if (cached) {
      setCurrentUser(cached);
    }
    // Fetch live demo student presets
    api.getDemoStudents()
      .then((res) => {
        if (res?.students) setDemoStudents(res.students);
      })
      .catch((err) => console.warn('Could not load demo presets:', err));
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  const handlePredictionComplete = (
    pred: PredictionResponse,
    inputs: PredictionRequest
  ) => {
    setActivePrediction(pred);
    setActiveInputs(inputs);
    setCurrentPage('result');
  };

  const handleLoadPreset = (preset: DemoStudentPreset) => {
    setActiveInputs(preset.features);
    setActivePrediction(preset.prediction);
    setCurrentPage('result');
  };

  const handleSelectRecordFromHistory = (record: PredictionRecord) => {
    setActiveInputs(record.inputFeatures);
    setActivePrediction({
      score: record.score,
      category: record.category,
      strengths: record.strengths,
      skill_gaps: record.skillGaps,
      recommendations: record.recommendations,
      model_name: record.modelName,
      created_at: record.createdAt,
    });
    setCurrentPage('result');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onStartAssessment={() => setCurrentPage(currentUser ? 'assessment' : 'login')}
            onExploreInsights={() => setCurrentPage('insights')}
            onLoadPreset={handleLoadPreset}
            demoStudents={demoStudents}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setCurrentPage('register')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateLogin={() => setCurrentPage('login')}
          />
        )}

        {currentPage === 'dashboard' && currentUser && (
          <DashboardPage
            currentUser={currentUser}
            onStartAssessment={() => setCurrentPage('assessment')}
            onViewHistory={() => setCurrentPage('history')}
            onSelectPrediction={handleSelectRecordFromHistory}
          />
        )}

        {currentPage === 'assessment' && (
          <AssessmentPage
            onPredictionComplete={handlePredictionComplete}
            initialValues={activeInputs}
          />
        )}

        {currentPage === 'result' && activePrediction && activeInputs && (
          <ResultPage
            prediction={activePrediction}
            inputFeatures={activeInputs}
            onRetake={() => setCurrentPage('assessment')}
            onViewHistory={() => setCurrentPage('history')}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            onSelectRecord={handleSelectRecordFromHistory}
            onNewAssessment={() => setCurrentPage('assessment')}
          />
        )}

        {currentPage === 'insights' && <ModelInsightsPage />}

        {currentPage === 'profile' && currentUser && (
          <ProfilePage
            currentUser={currentUser}
            onProfileUpdated={(newName) => {
              setCurrentUser((prev) => (prev ? { ...prev, name: newName } : null));
            }}
          />
        )}

        {currentPage === 'about' && <AboutPage />}
      </main>

      {/* Academic Footer - hidden on home and dashboard pages */}
      {!['dashboard', 'landing'].includes(currentPage) && <Footer />}
    </div>
  );
}
