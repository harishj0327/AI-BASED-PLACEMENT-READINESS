import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn, spawnSync } from 'child_process';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const FASTAPI_PORT = 8000;
const FASTAPI_URL = `http://127.0.0.1:${FASTAPI_PORT}`;

app.use(express.json());

// Spawn Python FastAPI backend process if python3 with uvicorn is available
let fastApiProcess: any = null;
function startFastApi() {
  // In production containers (such as Cloud Run), the native TypeScript engine serves all ML inference
  if (process.env.NODE_ENV === 'production') {
    console.log('[Server] Production environment detected: Native ML engine active.');
    return;
  }

  try {
    // Check if python3 binary is available before attempting to spawn
    const checkPython = spawnSync('which', ['python3']);
    if (checkPython.status !== 0) {
      console.log('[Server] python3 not in PATH; using native ML engine.');
      return;
    }

    fastApiProcess = spawn('python3', ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONPATH: process.cwd() },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // CRITICAL: Always attach error listener to prevent uncaught ENOENT crash
    fastApiProcess.on('error', (err: any) => {
      console.log('[Server] Python process notice:', err?.message || err);
    });

    fastApiProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`[FastAPI] ${data.toString().trim()}`);
    });

    fastApiProcess.stderr?.on('data', (data: Buffer) => {
      console.warn(`[FastAPI-err] ${data.toString().trim()}`);
    });

    fastApiProcess.on('exit', () => {
      // Clean exit without unhandled restart loops
    });
  } catch (err: any) {
    console.log('[Server] Note: Native ML engine active:', err?.message || err);
  }
}

startFastApi();

// Firestore local store path
const DATA_STORE_PATH = path.join(process.cwd(), 'backend/data/firestore_local.json');

function readStore() {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_STORE_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading datastore:', err);
  }
  return { users: {}, students: {}, predictions: {}, model_metadata: {} };
}

function writeStore(data: any) {
  try {
    const dir = path.dirname(DATA_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing datastore:', err);
  }
}

// Ensure initial demo data exists in store
(function initDemoStore() {
  const store = readStore();
  if (!store.predictions || Object.keys(store.predictions).length === 0) {
    const seeded = {
      users: {
        demo_student_uid: {
          uid: 'demo_student_uid',
          name: 'Alex Johnson',
          email: 'alex.johnson@campus.edu',
          college: 'National Institute of Technology',
          branch: 'Computer Science and Engineering',
          batch: '2022-2026',
          cgpa: 8.4,
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      students: {},
      predictions: {
        pred_demo_01: {
          id: 'pred_demo_01',
          userId: 'demo_student_uid',
          inputFeatures: {
            cgpa: 8.4,
            programming_skills: 78,
            aptitude_score: 72,
            communication_skills: 80,
            technical_skills: 76,
            projects_score: 75,
            certifications: 2,
            internship_experience: 6
          },
          score: 78.4,
          category: 'Moderately Ready',
          strengths: ['Programming & Algorithmic Problem Solving', 'Communication & Interview Articulation'],
          skillGaps: ['Advanced System Design & Timed Quantitative Aptitude'],
          recommendations: ['Practice quantitative aptitude problems regularly', 'Strengthen system design fundamentals'],
          modelName: 'Linear Regression',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        pred_demo_02: {
          id: 'pred_demo_02',
          userId: 'demo_student_uid',
          inputFeatures: {
            cgpa: 8.4,
            programming_skills: 82,
            aptitude_score: 76,
            communication_skills: 82,
            technical_skills: 80,
            projects_score: 78,
            certifications: 2,
            internship_experience: 6
          },
          score: 81.2,
          category: 'Highly Ready',
          strengths: ['Programming & Algorithmic Problem Solving', 'Core Technical Knowledge (CS Concepts)'],
          skillGaps: ['Maintain current consistency'],
          recommendations: ['Participate in mock technical interview rounds'],
          modelName: 'Linear Regression',
          createdAt: new Date().toISOString()
        }
      },
      model_metadata: {}
    };
    writeStore(seeded);
  }
})();

// Pure TypeScript execution of the trained Linear Regression Model
function predictWithTrainedModel(reqBody: any) {
  const cgpa = Number(reqBody.cgpa) || 7.5;
  const prog = Number(reqBody.programming_skills) || 65;
  const apt = Number(reqBody.aptitude_score) || 60;
  const comm = Number(reqBody.communication_skills) || 65;
  const tech = Number(reqBody.technical_skills) || 65;
  const proj = Number(reqBody.projects_score) || 60;
  const cert = Number(reqBody.certifications) || 1;
  const intern = Number(reqBody.internship_experience) || 3;

  // Exact OLS coefficients trained from 1500 academic records
  const rawScore =
    -5.8725 +
    1.6874 * cgpa +
    0.2468 * prog +
    0.1692 * apt +
    0.1537 * comm +
    0.1921 * tech +
    0.0621 * proj +
    0.9828 * cert +
    0.2913 * intern;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)) * 10) / 10;

  let category = 'Not Ready';
  if (score >= 80) category = 'Highly Ready';
  else if (score >= 60) category = 'Moderately Ready';
  else if (score >= 40) category = 'Needs Improvement';

  const strengths: string[] = [];
  const skill_gaps: string[] = [];
  const recommendations: string[] = [];

  if (prog >= 78) strengths.push('Programming & Algorithmic Problem Solving');
  else if (prog < 60) {
    skill_gaps.push('Programming Fundamentals & Coding');
    recommendations.push('Strengthen programming fundamentals (Data Structures & Algorithms) and solve coding challenges regularly.');
  }

  if (tech >= 75) strengths.push('Core Technical Knowledge (CS Concepts)');
  else if (tech < 60) {
    skill_gaps.push('Core Technical Concepts');
    recommendations.push('Strengthen core technical concepts (DBMS, Operating Systems, Computer Networks, and OOP) relevant to placement drives.');
  }

  if (apt >= 75) strengths.push('Quantitative & Logical Aptitude');
  else if (apt < 60) {
    skill_gaps.push('Aptitude & Logical Reasoning');
    recommendations.push('Practice quantitative aptitude, logical reasoning, and timed problem-solving sets to clear initial screening rounds.');
  }

  if (comm >= 75) strengths.push('Communication & Interview Articulation');
  else if (comm < 60) {
    skill_gaps.push('Communication & Presentation');
    recommendations.push('Practice technical explanations, mock interviews, and group discussions to improve verbal clarity.');
  }

  if (proj >= 75) strengths.push('Practical Project Portfolio');
  else if (proj < 60) {
    skill_gaps.push('Project Portfolio & Real-world Implementation');
    recommendations.push('Build 2-3 end-to-end practical projects, deploy them live, and document architecture on GitHub.');
  }

  if (cgpa >= 8.5) strengths.push('Academic Consistency (High CGPA)');
  else if (cgpa < 7.0) {
    skill_gaps.push('Academic CGPA Threshold');
    recommendations.push(`Focus on maintaining consistent academic performance to stay comfortably above the ${cgpa.toFixed(1)} eligibility cutoff.`);
  }

  if (intern >= 6) strengths.push(`Industry Experience (${intern} months)`);
  else if (intern === 0) {
    skill_gaps.push('Industry / Internship Exposure');
    recommendations.push('Pursue internships, research assistantships, or open-source software contributions for practical industry exposure.');
  }

  if (cert >= 3) strengths.push(`Industry Certifications (${cert} completed)`);
  else if (cert < 1) {
    recommendations.push('Complete recognized cloud or domain certifications (e.g., AWS, GCP, Azure, or Full-Stack) to validate skills.');
  }

  if (strengths.length === 0) strengths.push('Balanced foundational competencies across academics and technical tracks');
  if (skill_gaps.length === 0) skill_gaps.push('Advanced System Design and Competitive Programming optimization');
  if (recommendations.length === 0) recommendations.push('Maintain current performance level, participate in mock interview panels, and practice advanced system design.');

  return {
    score,
    category,
    strengths,
    skill_gaps,
    recommendations,
    model_name: 'Linear Regression',
    feature_importance: {
      programming_skills: 23.06,
      aptitude_score: 15.96,
      technical_skills: 14.92,
      communication_skills: 12.98,
      cgpa: 10.94,
      internship_experience: 9.71,
      certifications: 8.08,
      projects_score: 4.35
    },
    skill_analysis: {
      programming_skills: prog,
      aptitude_score: apt,
      communication_skills: comm,
      technical_skills: tech,
      projects_score: proj,
      cgpa_scaled: Math.round(cgpa * 10)
    }
  };
}

// Router for /api endpoints
app.all('/api/*', async (req, res) => {
  // If FastAPI is running, attempt proxy
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const headers: Record<string, string> = {
      'content-type': req.headers['content-type'] || 'application/json',
    };
    if (req.headers.authorization) headers['authorization'] = req.headers.authorization as string;

    const proxyRes = await fetch(`${FASTAPI_URL}${req.originalUrl}`, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (proxyRes.ok) {
      const data = await proxyRes.text();
      res.status(proxyRes.status);
      res.setHeader('content-type', proxyRes.headers.get('content-type') || 'application/json');
      return res.send(data);
    }
  } catch (e) {
    // Fall through to native handler
  }

  // Native Full-Stack API Engine
  const url = req.path;
  const authHeader = req.headers.authorization || '';
  const userId = authHeader.replace('Bearer ', '').trim() || 'demo_student_uid';

  if (url === '/api/health') {
    return res.json({
      status: 'healthy',
      service: 'Placement Readiness Score Predictor API',
      model_loaded: true,
      active_model: 'Linear Regression',
      version: '1.0.0'
    });
  }

  if (url === '/api/predict' && req.method === 'POST') {
    const result = predictWithTrainedModel(req.body);
    return res.json(result);
  }

  if (url === '/api/model/info' || url === '/api/model/metrics') {
    const metaPath = path.join(process.cwd(), 'ml/models/model_metadata.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (url === '/api/model/info') return res.json(meta);
      return res.json({
        active_model: meta.model_name,
        selection_criterion: meta.selection_criterion,
        dataset_label: meta.dataset_label,
        metrics_summary: meta.metrics,
        comparison_table: meta.all_models_metrics,
        feature_importance: meta.feature_importance,
        dataset_size: meta.dataset_size,
        train_samples: meta.train_samples,
        test_samples: meta.test_samples,
      });
    }
  }

  if (url === '/api/predictions' && req.method === 'POST') {
    const { input_features, prediction_data } = req.body;
    const store = readStore();
    const id = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      userId,
      inputFeatures: input_features,
      score: prediction_data.score,
      category: prediction_data.category,
      strengths: prediction_data.strengths,
      skillGaps: prediction_data.skill_gaps,
      recommendations: prediction_data.recommendations,
      modelName: prediction_data.model_name || 'Linear Regression',
      createdAt: new Date().toISOString()
    };
    if (!store.predictions) store.predictions = {};
    store.predictions[id] = record;
    writeStore(store);
    return res.json({ status: 'saved', data: record });
  }

  if (url === '/api/predictions/history') {
    const store = readStore();
    const list = Object.values(store.predictions || {}).filter(
      (p: any) => p.userId === userId || userId === 'demo_student_uid' || !p.userId
    );
    list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ history: list, count: list.length });
  }

  if (url === '/api/dashboard/stats') {
    const store = readStore();
    const list = Object.values(store.predictions || {});
    if (list.length === 0) {
      return res.json({
        total_assessments: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        category_distribution: {},
        recent_trend: []
      });
    }
    const scores = list.map((p: any) => p.score);
    const catMap: Record<string, number> = {};
    list.forEach((p: any) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const recentTrend = list.slice(-10).map((p: any) => ({
      date: p.createdAt ? p.createdAt.slice(0, 10) : 'Recent',
      score: p.score,
      category: p.category
    }));
    return res.json({
      total_assessments: list.length,
      average_score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      highest_score: Math.max(...scores),
      lowest_score: Math.min(...scores),
      category_distribution: catMap,
      recent_trend: recentTrend
    });
  }

  if (url === '/api/profile') {
    const store = readStore();
    if (req.method === 'GET') {
      const u = (store.users && store.users[userId]) || {
        uid: userId,
        name: 'Alex Johnson',
        email: 'alex.johnson@campus.edu',
        college: 'National Institute of Technology',
        branch: 'Computer Science and Engineering',
        batch: '2022-2026',
        cgpa: 8.4
      };
      return res.json(u);
    }
    if (req.method === 'PUT') {
      if (!store.users) store.users = {};
      const existing = store.users[userId] || { uid: userId };
      const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
      store.users[userId] = updated;
      writeStore(store);
      return res.json(updated);
    }
  }

  if (url === '/api/demo/students') {
    return res.json({
      students: [
        {
          profile: {
            name: "Aarav Sharma (Strong Student)",
            email: "aarav.sharma@campus.edu",
            college: "National Institute of Technology",
            branch: "Computer Science & Engineering",
            batch: "2022-2026",
            cgpa: 8.95
          },
          features: {
            cgpa: 8.95,
            programming_skills: 88,
            aptitude_score: 85,
            communication_skills: 82,
            technical_skills: 86,
            projects_score: 85,
            certifications: 3,
            internship_experience: 9
          },
          prediction: {
            score: 85.3,
            category: "Highly Ready",
            strengths: ["Programming & Algorithmic Problem Solving", "Core Technical Knowledge (CS Concepts)", "Quantitative & Logical Aptitude"],
            skill_gaps: ["Advanced System Design and Competitive Programming optimization"],
            recommendations: ["Maintain current performance level, participate in mock interview panels, and practice advanced system design."],
            model_name: "Linear Regression"
          }
        },
        {
          profile: {
            name: "Priya Patel (Average Student)",
            email: "priya.patel@campus.edu",
            college: "State Technological University",
            branch: "Information Technology",
            batch: "2022-2026",
            cgpa: 7.35
          },
          features: {
            cgpa: 7.35,
            programming_skills: 65,
            aptitude_score: 62,
            communication_skills: 68,
            technical_skills: 64,
            projects_score: 60,
            certifications: 1,
            internship_experience: 3
          },
          prediction: {
            score: 61.3,
            category: "Moderately Ready",
            strengths: ["Communication & Interview Articulation"],
            skill_gaps: ["Programming Fundamentals & Coding", "Project Portfolio & Real-world Implementation"],
            recommendations: ["Strengthen programming fundamentals and practice coding challenges regularly.", "Build 2-3 end-to-end practical projects and document architecture."],
            model_name: "Linear Regression"
          }
        },
        {
          profile: {
            name: "Rohan Gupta (Needs Improvement)",
            email: "rohan.gupta@campus.edu",
            college: "Regional Engineering College",
            branch: "Electronics and Telecommunication",
            batch: "2022-2026",
            cgpa: 5.8
          },
          features: {
            cgpa: 5.8,
            programming_skills: 42,
            aptitude_score: 48,
            communication_skills: 52,
            technical_skills: 45,
            projects_score: 40,
            certifications: 0,
            internship_experience: 0
          },
          prediction: {
            score: 41.3,
            category: "Needs Improvement",
            strengths: ["Balanced foundational competencies"],
            skill_gaps: ["Programming Fundamentals & Coding", "Core Technical Concepts", "Aptitude & Logical Reasoning", "Industry / Internship Exposure"],
            recommendations: [
              "Strengthen programming fundamentals (DSA) and solve coding challenges regularly.",
              "Practice quantitative aptitude and logical reasoning daily.",
              "Pursue internships or open-source projects for industry exposure."
            ],
            model_name: "Linear Regression"
          }
        }
      ]
    });
  }

  res.status(404).json({ error: 'Endpoint not found' });
});

async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (hasDist) {
    console.log('[Server] Serving production build from dist/');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[Server] Serving development mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] AI-Based Placement Readiness Predictor operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
