'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  CheckCircle2,
  Brain,
  Lock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">✓</span>
            </div>
            <span className="font-semibold text-lg text-foreground">
              KNL-Smoothing
            </span>
          </div>
          <nav className="flex gap-4">
            <Link href="/admin">
              <Button variant="ghost">Admin Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
              Fair, Transparent Credit Assessment
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Get instant, AI-powered credit decisions backed by explainable analysis.
              Our transparent approach ensures fair lending decisions for every applicant.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/apply')}
                className="gap-2"
              >
                Apply for Loan
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Why Choose CreditAssess AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.id} className="p-6">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            How It Works
          </h2>
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Apply?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete your application in minutes and get an instant assessment with full transparency.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/apply')}
            className="gap-2"
          >
            Start Your Application
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-muted-foreground">
          <p>
            © 2024 CreditAssess AI. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    id: 1,
    icon: Brain,
    title: 'AI-Powered',
    description: 'Advanced machine learning models for accurate risk assessment',
  },
  {
    id: 2,
    icon: Lock,
    title: 'Secure & Private',
    description: 'Bank-level security with encrypted data transmission',
  },
  {
    id: 3,
    icon: TrendingUp,
    title: 'Instant Decisions',
    description: 'Get real-time assessment results within minutes',
  },
  {
    id: 4,
    icon: CheckCircle2,
    title: 'Transparent',
    description: 'Full visibility into decision factors and explanations',
  },
];

const steps = [
  {
    id: 1,
    title: 'Complete Application',
    description:
      'Fill in your personal, employment, financial information and upload required documents.',
  },
  {
    id: 2,
    title: 'AI Processing',
    description:
      'Our pipeline extracts features, analyzes data, and runs multiple ML models in parallel.',
  },
  {
    id: 3,
    title: 'Instant Decision',
    description:
      'Receive a detailed assessment with risk score, model explanations, and similar case comparisons.',
  },
  {
    id: 4,
    title: 'Fast Funding',
    description: 'Approved applications move to funding stage for quick disbursement.',
  },
];
