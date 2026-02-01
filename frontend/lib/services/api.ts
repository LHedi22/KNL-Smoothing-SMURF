import mockData from './api.json';
import type {
  Application,
  AssessmentStatus,
  AssessmentResult,
  ProcessingStage,
} from '@/lib/types';

// Import local JSON mock data (same folder)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Keep a typed alias for easier use
const MOCK: any = mockData;

// Mock data generators that prefer local file data when available
export const generateMockApplication = (id: string): Application => {
  if (MOCK?.application) {
    const app = { ...MOCK.application } as Application;
    app.id = id;
    // keep timestamps up-to-date unless provided in the JSON
    app.createdAt = app.createdAt ?? new Date().toISOString();
    app.updatedAt = app.updatedAt ?? new Date().toISOString();
    return app;
  }

  // original fallback generator
  return {
    id,
    status: 'submitted',
    personalInfo: {
      firstName: 'James',
      lastName: 'Mitchell',
      email: 'james.mitchell@example.com',
      phone: '(555) 123-4567',
      dateOfBirth: '1985-06-15',
      ssn: '123-45-6789',
      address: '1247 Oak Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
    },
    employmentInfo: {
      employmentStatus: 'Employed',
      jobTitle: 'Senior Software Engineer',
      employer: 'TechCorp Industries',
      industry: 'Technology',
      yearsEmployed: 7,
      monthlyIncome: 12500,
    },
    financialInfo: {
      creditScore: 745,
      totalDebt: 45000,
      monthlyExpenses: 4200,
      savingsAmount: 125000,
      assetValue: 350000,
      bankruptcyHistory: false,
    },
    loanRequest: {
      loanAmount: 300000,
      loanPurpose: 'Home Purchase',
      loanTerm: 360,
      interestRate: 6.5,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const PIPELINE_STAGES: ProcessingStage[] = [
  'document_ocr',
  'feature_extraction',
  'similarity_search',
  'model_ensemble',
  'risk_aggregation',
  'explanation_generation',
];

const STAGE_DURATIONS: Record<ProcessingStage, number> = {
  document_ocr: 2000,
  feature_extraction: 3000,
  similarity_search: 4000,
  model_ensemble: 5000,
  risk_aggregation: 3000,
  explanation_generation: 2000,
};

const STAGE_DESCRIPTIONS: Record<ProcessingStage, string> = {
  document_ocr: 'Extracting text and data from uploaded documents using OCR technology',
  feature_extraction: 'Computing financial and employment features from application data',
  similarity_search: 'Finding similar historical cases using Qdrant vector database',
  model_ensemble: 'Running ensemble of ML models for risk scoring',
  risk_aggregation: 'Aggregating risk signals and computing final risk score',
  explanation_generation: 'Generating AI-powered explanations for the assessment',
};

export const generateMockAssessmentStatus = (
  applicationId: string,
  stageIndex: number
): AssessmentStatus => {
  // prefer JSON specified statuses (initial/completed)
  if (MOCK?.assessmentStatuses) {
    const chosen =
      stageIndex < PIPELINE_STAGES.length
        ? MOCK.assessmentStatuses.initial
        : MOCK.assessmentStatuses.completed;
    const status = { ...chosen } as AssessmentStatus;
    status.applicationId = applicationId;
    status.id = `assessment_${applicationId}`;
    return status;
  }

  // fallback dynamic generator
  const stages = PIPELINE_STAGES.map((stage, idx) => ({
    stage,
    status: idx < stageIndex ? ('completed' as const) : idx === stageIndex ? ('in_progress' as const) : ('pending' as const),
    progress:
      idx < stageIndex
        ? 100
        : idx === stageIndex
          ? Math.floor(Math.random() * 70) + 20
          : 0,
    estimatedTimeMs: STAGE_DURATIONS[stage],
    startedAt: idx <= stageIndex ? new Date().toISOString() : undefined,
    completedAt: idx < stageIndex ? new Date().toISOString() : undefined,
  }));

  const overallProgress = Math.round(
    stages.reduce((sum, s) => sum + s.progress, 0) / stages.length
  );

  return {
    id: `assessment_${applicationId}`,
    applicationId,
    currentStage: PIPELINE_STAGES[Math.min(stageIndex, PIPELINE_STAGES.length - 1)],
    stages,
    overallProgress,
    status: stageIndex < PIPELINE_STAGES.length ? 'processing' : 'completed',
  };
};

export const generateMockAssessmentResult = (
  applicationId: string
): AssessmentResult => {
  if (MOCK?.assessmentResult) {
    const result = { ...MOCK.assessmentResult } as AssessmentResult;
    result.applicationId = applicationId;
    result.id = result.id ?? `result_${applicationId}`;
    return result;
  }

  // fallback computation (original)
  const creditScore = 745;
  const debtToIncomeRatio = 0.336;
  const employmentStability = 0.85;
  const savingsRatio = 2.98;

  const overallScore = Math.round(
    (creditScore / 850) * 0.4 +
      (1 - Math.min(debtToIncomeRatio, 1)) * 0.25 +
      employmentStability * 0.2 +
      Math.min(savingsRatio / 3, 1) * 0.15
  );

  return {
    id: `result_${applicationId}`,
    applicationId,
    riskScore: {
      overallScore,
      level: overallScore > 70 ? 'low' : overallScore > 40 ? 'medium' : 'high',
      confidence: 0.92,
      factors: [
        {
          name: 'Credit Score',
          impact: 0.35,
          direction: 'positive',
          explanation: 'Excellent credit history with 745 FICO score',
        },
        {
          name: 'Debt-to-Income Ratio',
          impact: 0.25,
          direction: 'positive',
          explanation: 'Low DTI of 33.6% indicates strong repayment capacity',
        },
        {
          name: 'Employment Stability',
          impact: 0.2,
          direction: 'positive',
          explanation: '7 years with current employer shows stability',
        },
        {
          name: 'Savings Reserve',
          impact: 0.15,
          direction: 'positive',
          explanation: 'Substantial savings of $125K provides safety buffer',
        },
        {
          name: 'Loan-to-Value Ratio',
          impact: 0.05,
          direction: 'positive',
          explanation: '85.7% LTV on $350K asset value',
        },
      ],
    },
    modelContributions: [
      {
        modelName: 'Gradient Boosting Model',
        weight: 0.35,
        score: 82,
        confidence: 0.95,
      },
      {
        modelName: 'Neural Network Classifier',
        weight: 0.3,
        score: 78,
        confidence: 0.88,
      },
      {
        modelName: 'Random Forest Ensemble',
        weight: 0.2,
        score: 75,
        confidence: 0.92,
      },
      {
        modelName: 'Logistic Regression',
        weight: 0.15,
        score: 80,
        confidence: 0.85,
      },
    ],
    similarCases: [],
    anomalies: [],
    explanation: 'Applicant presents strong credit profile with excellent financial stability.',
    recommendations: ['Approve with standard terms'],
  };
};

// API calls (mocked for now)
// use mockData when present, otherwise fallback
export const createApplication = async (data: Partial<Application>): Promise<Application> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = `app_${Date.now()}`;
      if (MOCK?.application) {
        const app: Application = {
          ...MOCK.application,
          ...data,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(app);
        return;
      }
      const app = generateMockApplication(newId);
      resolve({ ...app, ...data });
    }, 500);
  });
};

export const getApplication = async (id: string): Promise<Application> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK?.application) {
        const app = { ...MOCK.application } as Application;
        app.id = id;
        resolve(app);
        return;
      }
      resolve(generateMockApplication(id));
    }, 300);
  });
};

export const startAssessment = async (applicationId: string): Promise<AssessmentStatus> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK?.assessmentStatuses?.initial) {
        const status = { ...MOCK.assessmentStatuses.initial } as AssessmentStatus;
        status.applicationId = applicationId;
        status.id = `assessment_${applicationId}`;
        // ensure it's in-progress form
        status.status = 'processing';
        resolve(status);
        return;
      }
      resolve(generateMockAssessmentStatus(applicationId, 0));
    }, 500);
  });
};

export const getAssessmentStatus = async (assessmentId: string): Promise<AssessmentStatus> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applicationId = assessmentId.replace('assessment_', '');
      if (MOCK?.assessmentStatuses) {
        // randomly return initial or completed status from JSON for variety
        const chosen = Math.random() > 0.5 ? MOCK.assessmentStatuses.initial : MOCK.assessmentStatuses.completed;
        const status = { ...chosen } as AssessmentStatus;
        status.applicationId = applicationId;
        status.id = assessmentId;
        resolve(status);
        return;
      }
      const stageIndex = Math.floor(Math.random() * 7);
      resolve(generateMockAssessmentStatus(applicationId, stageIndex));
    }, 200);
  });
};

export const getAssessmentResult = async (assessmentId: string): Promise<AssessmentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applicationId = assessmentId.replace('assessment_', '');
      if (MOCK?.assessmentResult) {
        const res = { ...MOCK.assessmentResult } as AssessmentResult;
        res.applicationId = applicationId;
        res.id = res.id ?? `result_${applicationId}`;
        resolve(res);
        return;
      }
      resolve(generateMockAssessmentResult(applicationId));
    }, 300);
  });
};

export const submitDecision = async (
  assessmentId: string,
  decision: 'approved' | 'rejected' | 'manual_review'
): Promise<AssessmentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applicationId = assessmentId.replace('assessment_', '');
      const result = generateMockAssessmentResult(applicationId);
      resolve({ ...result, decision: decision as 'approved' | 'rejected' | 'pending' });
    }, 500);
  });
};

export const uploadDocument = async (
  applicationId: string,
  file: File
): Promise<{ documentId: string; fileName: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        documentId: `doc_${Date.now()}`,
        fileName: file.name,
      });
    }, 800);
  });
};