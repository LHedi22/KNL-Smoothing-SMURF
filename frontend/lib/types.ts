export type ApplicationStatus =
  | 'pending'
  | 'submitted'
  | 'processing'
  | 'completed'
  | 'approved'
  | 'rejected'
  | 'manual_review';

export type ProcessingStage =
  | 'document_ocr'
  | 'feature_extraction'
  | 'similarity_search'
  | 'model_ensemble'
  | 'risk_aggregation'
  | 'explanation_generation';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface EmploymentInfo {
  employmentStatus: string;
  jobTitle: string;
  employer: string;
  industry: string;
  yearsEmployed: number;
  monthlyIncome: number;
}

export interface FinancialInfo {
  creditScore: number;
  totalDebt: number;
  monthlyExpenses: number;
  savingsAmount: number;
  assetValue: number;
  bankruptcyHistory: boolean;
}

export interface LoanRequest {
  loanAmount: number;
  loanPurpose: string;
  loanTerm: number;
  interestRate?: number;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  personalInfo: PersonalInfo;
  employmentInfo: EmploymentInfo;
  financialInfo: FinancialInfo;
  loanRequest: LoanRequest;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingStageStatus {
  stage: ProcessingStage;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  estimatedTimeMs: number;
  startedAt?: string;
  completedAt?: string;
}

export interface AssessmentStatus {
  id: string;
  applicationId: string;
  currentStage: ProcessingStage;
  stages: ProcessingStageStatus[];
  overallProgress: number;
  status: 'pending' | 'processing' | 'completed';
}

export interface RiskScore {
  overallScore: number;
  level: RiskLevel;
  confidence: number;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  impact: number;
  direction: 'positive' | 'negative';
  explanation: string;
}

export interface ModelContribution {
  modelName: string;
  weight: number;
  score: number;
  confidence: number;
}

export interface SimilarCase {
  id: string;
  similarity: number;
  applicantProfile: string;
  loanAmount: number;
  outcome: 'approved' | 'rejected';
  riskScore: number;
}

export interface AnomalyAlert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
}

export interface AssessmentResult {
  id: string;
  applicationId: string;
  riskScore: RiskScore;
  modelContributions: ModelContribution[];
  similarCases: SimilarCase[];
  anomalies: AnomalyAlert[];
  explanation: string;
  recommendations: string[];
  decision?: 'approved' | 'rejected' | 'pending';
  decisionReason?: string;
}

export interface ApplicationContextType {
  currentApplication: Application | null;
  currentAssessment: AssessmentStatus | null;
  currentResult: AssessmentResult | null;
  userRole: 'applicant' | 'analyst';
  isLoading: boolean;
  error: string | null;
  setCurrentApplication: (app: Application | null) => void;
  setCurrentAssessment: (assessment: AssessmentStatus | null) => void;
  setCurrentResult: (result: AssessmentResult | null) => void;
  setUserRole: (role: 'applicant' | 'analyst') => void;
  setError: (error: string | null) => void;
}
