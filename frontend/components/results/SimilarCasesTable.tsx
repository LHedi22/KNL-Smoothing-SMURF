'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SimilarCase } from '@/lib/types';
import { ChevronDown, CheckCircle2, XCircle } from 'lucide-react';

export function SimilarCasesTable({ cases }: { cases: SimilarCase[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Similar Historical Cases
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Showing {cases.length} most similar cases from historical data
      </p>
      <div className="space-y-3">
        {cases.map((caseItem) => (
          <div key={caseItem.id}>
            <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-foreground">
                      {caseItem.applicantProfile}
                    </h4>
                    <div className="flex items-center gap-1">
                      {caseItem.outcome === 'approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          caseItem.outcome === 'approved'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {caseItem.outcome === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Loan: ${(caseItem.loanAmount / 1000).toFixed(0)}K</span>
                    <span>Risk Score: {caseItem.riskScore}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Similarity:</span>
                      <div className="w-16 h-1.5 bg-muted rounded">
                        <div
                          className="h-full bg-primary rounded"
                          style={{ width: `${caseItem.similarity * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">
                        {Math.round(caseItem.similarity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedId(
                      expandedId === caseItem.id ? null : caseItem.id
                    )
                  }
                  className="ml-4"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedId === caseItem.id ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </div>

              {expandedId === caseItem.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Case ID:</strong> {caseItem.id}
                  </p>
                  <p>
                    <strong>Profile:</strong> {caseItem.applicantProfile}
                  </p>
                  <p>
                    <strong>Loan Amount:</strong> ${caseItem.loanAmount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Risk Score:</strong> {caseItem.riskScore}/100
                  </p>
                  <p>
                    <strong>Outcome:</strong>{' '}
                    <span
                      className={
                        caseItem.outcome === 'approved'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {caseItem.outcome === 'approved'
                        ? 'Approved'
                        : 'Rejected'}
                    </span>
                  </p>
                  <p>
                    <strong>Similarity Score:</strong>{' '}
                    {Math.round(caseItem.similarity * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
