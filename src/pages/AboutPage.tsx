import React from 'react';
import {
  BookOpen,
  Cpu,
  Cloud,
  Database,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Methodology &amp; Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          System Design &amp; ML Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Machine Learning and Cloud Computing Final Year Project Documentation
        </p>
      </div>

      {/* Academic Disclaimer Box */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-amber-200 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Academic Project Formulation Notice</span>
        </div>
        <p>
          <strong>Prototype trained on a generated academic dataset.</strong> The system models
          placement readiness as an empirical score from 0–100 derived from multiple academic,
          technical, and experience dimensions. The score represents model-estimated readiness based
          on the selected features; it does not guarantee hiring or placement outcomes.
        </p>
      </div>

      {/* Problem Statement & Objectives */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-white">1. Problem Statement &amp; Objectives</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Traditional campus placement screening often relies excessively on cumulative CGPA as an
          initial cutoff filter. However, industry recruiting demands a multi-factor blend of
          algorithmic problem-solving, core computer science concepts, verbal articulation,
          practical project deployment, and professional internship experience.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          This system implements continuous regression modeling to synthesize 8 distinct attributes
          into a single calibrated Placement Readiness Score (0–100), detects specific competency
          bottlenecks, and provides personalized, actionable recommendations for remediation.
        </p>
      </div>

      {/* 4 Models Evaluated */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-white">2. Machine Learning Algorithms</h2>
        <p className="text-xs text-slate-400">
          Four distinct regression paradigms were implemented and evaluated on a held-out test split
          using scikit-learn:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-semibold text-blue-400">Linear Regression (Selected)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Fits optimal linear hyperplane with least-squares minimization. Achieved the lowest
              RMSE (4.549) and highest R² (0.7817) due to balanced continuous feature correlations.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-semibold text-emerald-400">Support Vector Regressor (SVR)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Radial Basis Function (RBF) kernel mapping inputs into high-dimensional space with
              margin tolerance. MAE: 3.822, RMSE: 4.796, R²: 0.7572.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-semibold text-indigo-400">Random Forest Regressor</h3>
            <p className="text-xs text-slate-400 mt-1">
              Ensemble of 150 bootstrapped decision trees with feature subsampling. Models non-linear
              interactions (e.g. coding + projects synergy). MAE: 3.997, RMSE: 5.095, R²: 0.7261.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-semibold text-amber-400">Decision Tree Regressor</h3>
            <p className="text-xs text-slate-400 mt-1">
              Greedy orthogonal partitioning using variance reduction splits. Prone to piecewise step
              discontinuities on continuous score prediction. MAE: 5.250, RMSE: 6.670, R²: 0.5306.
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Architecture */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-white">3. Cloud &amp; Distributed Architecture</h2>
        <p className="text-xs text-slate-400">
          The application follows a cloud-native, microservices-ready structure:
        </p>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
          Student Client (React SPA on Vite) <br />
          &nbsp;&nbsp;&nbsp;&nbsp;↓ REST APIs (HTTPS Bearer Token Auth) <br />
          Backend Service (FastAPI running on Google Cloud Run) <br />
          &nbsp;&nbsp;&nbsp;&nbsp;↓ Scikit-Learn Inference Pipeline (joblib artifacts) <br />
          Datastore &amp; Auth (Google Cloud Firestore + Firebase Authentication)
        </div>

        <ul className="text-xs text-slate-300 space-y-2 pt-2">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span>
              <strong>Google Cloud Run:</strong> Stateless container execution with auto-scaling to
              zero for cost-efficient deployment.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>
              <strong>Cloud Firestore:</strong> NoSQL document datastore partitioned into collections{' '}
              <code>users</code>, <code>students</code>, <code>predictions</code>, and{' '}
              <code>model_metadata</code>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
            <span>
              <strong>Firebase Authentication:</strong> Token-based cryptographically verified
              identity preventing unauthorized spoofing.
            </span>
          </li>
        </ul>
      </div>

      {/* Viva / Faculty Presentation Notes */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-white">4. Viva &amp; Presentation Guidance</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          When asked by faculty why continuous regression was chosen over binary classification
          (&quot;Placed / Not Placed&quot;):
        </p>
        <blockquote className="p-3.5 rounded-lg bg-slate-950 border-l-4 border-blue-500 text-xs text-slate-300 italic">
          &quot;Binary placement classification suffers from high noise (a student may receive 5 offers
          or miss by a hair in a final HR round due to company hiring freeze). A continuous 0–100
          readiness score accurately reflects the student&apos;s holistic capability curve, preserves
          gradient information, and enables fine-grained tracking of improvement over time.&quot;
        </blockquote>
      </div>
    </div>
  );
};
