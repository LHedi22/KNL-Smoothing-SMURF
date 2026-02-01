'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationProvider, useApplication } from '@/lib/context/ApplicationContext';
import { ResultsDisplay } from '@/components/results/ResultsDisplay';
import { getAssessmentResult, submitDecision, getApplication } from '@/lib/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ResultsPageContent({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const { currentResult, setCurrentResult, userRole, setUserRole } = useApplication();
  const [error, setError] = useState<string | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);

  // Fetch application data and results
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appData, result] = await Promise.all([
          getApplication(applicationId),
          getAssessmentResult(`assessment_${applicationId}`),
        ]);
        setApplicationData(appData);
        setCurrentResult(result);
      } catch (err) {
        setError('Failed to load results');
        console.error(err);
      }
    };
    fetchData();
  }, [applicationId, setCurrentResult]);

  const handleDecision = async (decision: 'approved' | 'rejected' | 'manual_review') => {
    setIsDeciding(true);
    try {
      const result = await submitDecision(`assessment_${applicationId}`, decision);
      setCurrentResult(result);
      // Show confirmation
      setTimeout(() => {
        router.push(`/?decision=${decision}`);
      }, 2000);
    } catch (err) {
      setError('Failed to submit decision');
    } finally {
      setIsDeciding(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </Card>
      </div>
    );
  }

  if (!currentResult || !applicationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Assessment Results
            </h1>
            <p className="text-muted-foreground">
              Application ID: {applicationId}
            </p>
          </div>

          {/* Role Toggle for Analyst View */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View as:</span>
            <ToggleGroup
              type="single"
              value={userRole}
              onValueChange={(value) => {
                if (value) setUserRole(value as 'applicant' | 'analyst');
              }}
            >
              <ToggleGroupItem value="applicant">Applicant</ToggleGroupItem>
              <ToggleGroupItem value="analyst">Analyst</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Applicant Info Card */}
        <Card className="mb-8 p-6 bg-primary/5 border-primary/20">
          <h2 className="font-semibold text-foreground mb-4">Applicant Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Name</p>
              <p className="font-medium text-foreground">
                {applicationData.personalInfo.firstName}{' '}
                {applicationData.personalInfo.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Employment</p>
              <p className="font-medium text-foreground">
                {applicationData.employmentInfo.jobTitle}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Credit Score</p>
              <p className="font-medium text-foreground">
                {applicationData.financialInfo.creditScore}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Loan Amount</p>
              <p className="font-medium text-foreground">
                ${applicationData.loanRequest.loanAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Main Results */}
        <ResultsDisplay
          result={currentResult}
          userRole={userRole}
          onDecision={handleDecision}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
          <Button
            onClick={() => router.push('/admin')}
            variant="outline"
          >
            View All Applications
          </Button>
        </div>
      </div>
    </main>
  );
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <ApplicationProvider>
      <ResultsPageContent applicationId={id} />
    </ApplicationProvider>
  );
}
