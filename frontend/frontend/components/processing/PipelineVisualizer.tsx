'use client';

import React from "react"

import { Card } from '@/components/ui/card';
import type { AssessmentStatus, ProcessingStage } from '@/lib/types';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Zap,
  Brain,
  BarChart3,
} from 'lucide-react';

const STAGE_ICONS: Record<ProcessingStage, React.ReactNode> = {
  document_ocr: <Database className="w-5 h-5" />,
  feature_extraction: <Zap className="w-5 h-5" />,
  similarity_search: <BarChart3 className="w-5 h-5" />,
  model_ensemble: <Brain className="w-5 h-5" />,
  risk_aggregation: <BarChart3 className="w-5 h-5" />,
  explanation_generation: <Clock className="w-5 h-5" />,
};

const STAGE_LABELS: Record<ProcessingStage, string> = {
  document_ocr: 'Document OCR',
  feature_extraction: 'Feature Extraction',
  similarity_search: 'Similarity Search',
  model_ensemble: 'Model Ensemble',
  risk_aggregation: 'Risk Aggregation',
  explanation_generation: 'Explanation Generation',
};

const STAGE_DESCRIPTIONS: Record<ProcessingStage, string> = {
  document_ocr: 'Extracting text and data from uploaded documents using OCR technology',
  feature_extraction:
    'Computing financial and employment features from application data',
  similarity_search: 'Finding similar historical cases using Qdrant vector database',
  model_ensemble: 'Running ensemble of ML models for risk scoring',
  risk_aggregation: 'Aggregating risk signals and computing final risk score',
  explanation_generation:
    'Generating AI-powered explanations for the assessment',
};

export function PipelineVisualizer({ assessment }: { assessment: AssessmentStatus }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Overall Progress
            </h3>
            <p className="text-sm text-muted-foreground">
              {assessment.stages.filter((s) => s.status === 'completed').length} of {assessment.stages.length} stages
              completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">
              {assessment.overallProgress}%
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${assessment.overallProgress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {assessment.stages.map((stage, idx) => (
          <StageCard key={stage.stage} stage={stage} isLast={idx === assessment.stages.length - 1} />
        ))}
      </div>
    </div>
  );
}

function StageCard({
  stage,
  isLast,
}: {
  stage: (typeof ProcessingStage) & {
    stage: ProcessingStage;
    status: 'pending' | 'in_progress' | 'completed';
    progress: number;
    estimatedTimeMs: number;
  };
  isLast: boolean;
}) {
  const label = STAGE_LABELS[stage.stage];
  const description = STAGE_DESCRIPTIONS[stage.stage];
  const icon = STAGE_ICONS[stage.stage];

  const isCompleted = stage.status === 'completed';
  const isInProgress = stage.status === 'in_progress';
  const isPending = stage.status === 'pending';

  return (
    <>
      <Card
        className={`p-6 transition-all ${
          isInProgress
            ? 'ring-2 ring-primary/50 bg-primary/5'
            : isCompleted
              ? 'bg-primary/5'
              : 'opacity-60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : isInProgress
                    ? 'bg-primary/50 text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isInProgress ? (
                icon
              ) : (
                icon
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{label}</h4>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>

              {!isPending && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{stage.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isInProgress ? 'bg-primary' : 'bg-primary'
                      }`}
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {isInProgress && (
                <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Processing...
                </div>
              )}

              {isPending && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Waiting to start...
                </div>
              )}
            </div>
          </div>

          {isCompleted && (
            <div className="text-primary flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
        </div>
      </Card>

      {!isLast && (
        <div className="flex justify-center">
          <div className="w-0.5 h-4 bg-border" />
        </div>
      )}
    </>
  );
}
