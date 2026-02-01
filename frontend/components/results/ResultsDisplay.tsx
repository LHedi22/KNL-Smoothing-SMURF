'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AssessmentResult, RiskLevel } from '@/lib/types';
import {
  AlertTriangle,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { SimilarCasesTable } from './SimilarCasesTable';
import { RiskGauge } from './RiskGauge';

interface ResultsDisplayProps {
  result: AssessmentResult;
  userRole: 'applicant' | 'analyst';
  onDecision?: (decision: 'approved' | 'rejected' | 'manual_review') => void;
}

export function ResultsDisplay({
  result,
  userRole,
  onDecision,
}: ResultsDisplayProps) {
  const riskLevel = result.riskScore.level;
  const riskColor =
    riskLevel === 'low'
      ? 'text-green-600'
      : riskLevel === 'medium'
        ? 'text-yellow-600'
        : 'text-red-600';
  const riskBgColor =
    riskLevel === 'low'
      ? 'bg-green-50'
      : riskLevel === 'medium'
        ? 'bg-yellow-50'
        : 'bg-red-50';

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`p-8 ${riskBgColor} border-current`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Overall Risk Assessment
              </p>
              <h2 className={`text-4xl font-bold ${riskColor}`}>
                {result.riskScore.overallScore}/100
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Risk Level: <span className={`font-semibold ${riskColor} capitalize`}>{riskLevel}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(result.riskScore.confidence * 100)}%
              </p>
            </div>
            {riskLevel === 'low' && (
              <CheckCircle2 className={`w-12 h-12 ${riskColor}`} />
            )}
            {riskLevel === 'medium' && (
              <AlertCircle className={`w-12 h-12 ${riskColor}`} />
            )}
            {riskLevel === 'high' && (
              <AlertTriangle className={`w-12 h-12 ${riskColor}`} />
            )}
          </div>
        </Card>
        <RiskGauge score={result.riskScore.overallScore} />
      </div>

      {/* Risk Factors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Key Risk Factors
        </h3>
        <div className="space-y-4">
          {result.riskScore.factors.map((factor, idx) => (
            <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  factor.direction === 'positive'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              >
                {factor.direction === 'positive' ? '✓' : '!'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{factor.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {factor.explanation}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-muted rounded">
                    <div
                      className={`h-full rounded ${
                        factor.direction === 'positive'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${factor.impact * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(factor.impact * 100)}% impact
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Model Contributions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Model Contributions
        </h3>
        <div className="space-y-4">
          {result.modelContributions.map((model, idx) => (
            <div key={idx} className="pb-4 border-b last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">{model.modelName}</h4>
                <span className="text-sm font-semibold text-primary">
                  {model.score}/100
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-muted rounded">
                  <div
                    className="h-full bg-primary rounded"
                    style={{ width: `${model.score}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(model.weight * 100)}% weight
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round(model.confidence * 100)}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Similar Cases */}
      <SimilarCasesTable cases={result.similarCases} />

      {/* Anomalies */}
      {result.anomalies.length > 0 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50/50">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Anomalies Detected
          </h3>
          <div className="space-y-4">
            {result.anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={`p-4 rounded-lg border ${
                  anomaly.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : anomaly.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                }`}
              >
                <h4 className="font-semibold text-foreground mb-1">
                  {anomaly.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {anomaly.description}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Recommendation: {anomaly.recommendation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Explanation Panel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Assessment Summary
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {result.explanation}
        </p>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="text-primary font-bold">•</span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Action Buttons for Analyst */}
      {userRole === 'analyst' && onDecision && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Analyst Decision
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => onDecision('approved')}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              onClick={() => onDecision('manual_review')}
              variant="outline"
            >
              Manual Review
            </Button>
            <Button
              onClick={() => onDecision('rejected')}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
