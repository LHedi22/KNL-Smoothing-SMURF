"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AssessmentResult, RiskLevel } from "@/lib/types";
import {
  AlertTriangle,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  Brain,
  Layers,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SimilarCasesTable } from "./SimilarCasesTable";
import { RiskGauge } from "./RiskGauge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ModelMeta = {
  icon: ReactNode;
  keywords: string[];
  isKnnSmoothed: boolean;
  kValue?: number;
};

const DEFAULT_MODEL_META: ModelMeta = {
  icon: <Zap className="w-5 h-5" />,
  keywords: ["Ensemble", "General risk"],
  isKnnSmoothed: false,
  kValue: undefined,
};

const MODEL_METADATA: Record<string, ModelMeta> = {
  LightGBM: {
    icon: <TrendingUp className="w-5 h-5" />,
    keywords: ["Gradient boosting", "Tree-based", "Fast inference"],
    isKnnSmoothed: true,
    kValue: 64,
  },
  "Logistic Regression": {
    icon: <Layers className="w-5 h-5" />,
    keywords: ["Linear", "Interpretable", "Calibrated"],
    isKnnSmoothed: false,
    kValue: undefined,
  },
  XGBoost: {
    icon: <Sparkles className="w-5 h-5" />,
    keywords: ["Boosted trees", "High signal", "Non-linear"],
    isKnnSmoothed: true,
    kValue: 32,
  },
  "Neural Risk Net": {
    icon: <Brain className="w-5 h-5" />,
    keywords: ["Deep learning", "Embedding", "Sequence aware"],
    isKnnSmoothed: true,
    kValue: 50,
  },
  "Similarity Ensemble": {
    icon: <BarChart3 className="w-5 h-5" />,
    keywords: ["Case-based", "Neighbor voting", "Explainable"],
    isKnnSmoothed: true,
    kValue: 15,
  },
};

const getModelMeta = (modelName: string): ModelMeta => {
  return MODEL_METADATA[modelName] ?? DEFAULT_MODEL_META;
};

interface ResultsDisplayProps {
  result: AssessmentResult;
  userRole: "applicant" | "analyst";
  onDecision?: (decision: "approved" | "rejected" | "manual_review") => void;
}

export function ResultsDisplay({
  result,
  userRole,
  onDecision,
}: ResultsDisplayProps) {
  const riskLevel = result.riskScore.level;
  const riskColor =
    riskLevel === "low"
      ? "text-green-600"
      : riskLevel === "medium"
        ? "text-yellow-600"
        : "text-red-600";
  const riskBgColor =
    riskLevel === "low"
      ? "bg-green-50"
      : riskLevel === "medium"
        ? "bg-yellow-50"
        : "bg-red-50";
  const riskSummary = getRiskSummary(
    riskLevel,
    result.riskScore.overallScore,
    result.riskScore.confidence,
  );
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const isSimilarCasesModalOpen = Boolean(selectedModel);

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`p-8 ${riskBgColor} border-current`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Overall Default Risk Assessment
              </p>
              <h2 className={`text-4xl font-bold ${riskColor}`}>
                {result.riskScore.overallScore}/100
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Risk Level:{" "}
                <span className={`font-semibold ${riskColor} capitalize`}>
                  {riskLevel}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(result.riskScore.confidence * 100)}%
              </p>
            </div>
            {riskLevel === "low" && (
              <CheckCircle2 className={`w-12 h-12 ${riskColor}`} />
            )}
            {riskLevel === "medium" && (
              <AlertCircle className={`w-12 h-12 ${riskColor}`} />
            )}
            {riskLevel === "high" && (
              <AlertTriangle className={`w-12 h-12 ${riskColor}`} />
            )}
          </div>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            {riskSummary}
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Low Risk</div>
              <div className="font-semibold">0-33</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                Medium Risk
              </div>
              <div className="font-semibold">34-66</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                High Risk
              </div>
              <div className="font-semibold">67-100</div>
            </div>
          </div>
        </Card>
        {/* Model Contributions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Model Contributions
          </h3>
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className="pt-2"
          >
            <CarouselContent>
              {result.modelContributions.map((model, idx) => {
                const meta = getModelMeta(model.modelName);
                const keywords = model.keywords?.length
                  ? model.keywords
                  : meta.keywords.length
                    ? meta.keywords
                    : DEFAULT_MODEL_META.keywords;
                const isKnnSmoothed =
                  model.isKnnSmoothed ?? meta.isKnnSmoothed ?? false;
                const kValue =
                  model.kValue !== undefined && model.kValue !== null
                    ? model.kValue
                    : meta.kValue;
                return (
                  <CarouselItem
                    key={`${model.modelName}-${idx}`}
                    className="basis-full"
                  >
                    <div className="h-full p-4 border border-border rounded-lg space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          {meta.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {model.modelName}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Weight toward ensemble:{" "}
                                {Math.round(model.weight * 100)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                Score
                              </span>
                              <p className="text-lg font-semibold text-primary">
                                {model.score}/100
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {keywords.map((keyword) => (
                              <Badge
                                key={`${model.modelName}-${keyword}`}
                                variant="secondary"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded border border-dashed border-border">
                          <p className="text-[11px] uppercase text-muted-foreground tracking-wide mb-1">
                            Contribution Weight
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {Math.round(model.weight * 100)}%
                          </p>
                        </div>
                        <div className="p-3 rounded border border-dashed border-border">
                          <p className="text-[11px] uppercase text-muted-foreground tracking-wide mb-1">
                            Model Confidence
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {Math.round(model.confidence * 100)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge
                          variant={isKnnSmoothed ? "default" : "outline"}
                          className={
                            isKnnSmoothed
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }
                        >
                          {isKnnSmoothed ? "kNN Smoothed" : "Direct Output"}
                        </Badge>
                        <Badge variant="outline">
                          {kValue ? `k = ${kValue}` : "k = —"}
                        </Badge>
                        <Badge variant="outline">
                          Score: {model.score}/100
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-0 text-primary"
                          onClick={() => setSelectedModel(model.modelName)}
                        >
                          View Similar Cases
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {result.modelContributions.length > 1 && (
              <>
                <CarouselPrevious className="hidden sm:flex left-2 top-1/2 -translate-y-1/2 bg-background/70" />
                <CarouselNext className="hidden sm:flex right-2 top-1/2 -translate-y-1/2 bg-background/70" />
              </>
            )}
          </Carousel>
        </Card>
      </div>

      {/* Risk Factors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Key Risk Factors
        </h3>
        <div className="space-y-4">
          {result.riskScore.factors.map((factor, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 pb-4 border-b last:border-b-0"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  factor.direction === "positive"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {factor.direction === "positive" ? "✓" : "!"}
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
                        factor.direction === "positive"
                          ? "bg-green-500"
                          : "bg-red-500"
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

      {/* Similar Cases */}
      <SimilarCasesTable cases={result.similarCases} />

      <Dialog
        open={isSimilarCasesModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedModel(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Similar cases powering {selectedModel ?? "this model"}
            </DialogTitle>
            <DialogDescription>
              These are the historic applications referenced when smoothing the
              model output with k-nearest-neighbor blending.
            </DialogDescription>
          </DialogHeader>
          <SimilarCasesTable cases={result.similarCases} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedModel(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Buttons for Analyst */}
      {userRole === "analyst" && onDecision && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Analyst Decision
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => onDecision("approved")}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              onClick={() => onDecision("manual_review")}
              variant="outline"
            >
              Manual Review
            </Button>
            <Button
              onClick={() => onDecision("rejected")}
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

function getRiskSummary(level: RiskLevel, score: number, confidence: number) {
  const confidencePct = Math.round(confidence * 100);
  if (level === "low") {
    return `The applicant shows strong fundamentals, with a low default probability and ${confidencePct}% model confidence. Continued monitoring is recommended but no immediate action is required.`;
  }
  if (level === "medium") {
    return `Risk indicators are mixed. A score of ${score}/100 suggests moderate default likelihood, so consider requesting additional documentation or manual review. Model confidence is ${confidencePct}%.`;
  }
  return `The applicant triggers several high-risk signals, producing a ${score}/100 score and ${confidencePct}% confidence. Escalate for detailed review or request risk mitigations before approving.`;
}
