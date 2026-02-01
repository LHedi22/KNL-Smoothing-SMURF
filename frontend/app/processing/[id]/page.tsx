'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationProvider, useApplication } from '@/lib/context/ApplicationContext';
import { usePolling } from '@/lib/hooks/usePolling';
import { PipelineVisualizer } from '@/components/processing/PipelineVisualizer';
import { startAssessment, getAssessmentStatus, getAssessmentResult } from '@/lib/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AssessmentStatus } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ProcessingPageContent({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const { currentAssessment, setCurrentAssessment, setCurrentResult } = useApplication();
  const [error, setError] = useState<string | null>(null);

  // Initialize assessment
  useEffect(() => {
    const init = async () => {
      try {
        const assessment = await startAssessment(applicationId);
        setCurrentAssessment(assessment);
      } catch (err) {
        setError('Failed to start assessment');
      }
    };
    init();
  }, [applicationId, setCurrentAssessment]);

  // Poll for status updates every 2 seconds
  const { data: pollingData } = usePolling(
    async () => {
      if (!currentAssessment) return null;
      return getAssessmentStatus(currentAssessment.id);
    },
    {
      interval: 2000,
      enabled: currentAssessment?.status === 'processing',
    }
  );

  const assessment = pollingData || currentAssessment;

  // Fetch results when completed
  useEffect(() => {
    if (assessment?.status === 'completed') {
      const fetchResults = async () => {
        try {
          const result = await getAssessmentResult(assessment.id);
          setCurrentResult(result);
          // Redirect to results page
          setTimeout(() => {
            router.push(`/results/${applicationId}`);
          }, 1500);
        } catch (err) {
          setError('Failed to fetch results');
        }
      };
      fetchResults();
    }
  }, [assessment?.status, assessment?.id, applicationId, setCurrentResult, router]);

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

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Analyzing Your Application
          </h1>
          <p className="text-muted-foreground">
            Our AI system is processing your loan application through multiple stages.
          </p>
        </div>

        <PipelineVisualizer assessment={assessment} />

        {assessment.status === 'completed' && (
          <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
            <p className="text-foreground font-semibold mb-2">
              Assessment Complete!
            </p>
            <p className="text-muted-foreground text-sm">
              Redirecting to results page...
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}

export default async function ProcessingPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <ApplicationProvider>
      <ProcessingPageContent applicationId={id} />
    </ApplicationProvider>
  );
}
