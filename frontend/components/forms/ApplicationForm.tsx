'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, X, FileCheck } from 'lucide-react';
import type { Application } from '@/lib/types';
import { createApplication } from '@/lib/services/api';

interface Step {
  id: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 1, title: 'Personal Information', description: 'Basic personal details' },
  { id: 2, title: 'Employment', description: 'Your job information' },
  { id: 3, title: 'Financial', description: 'Financial status' },
  { id: 4, title: 'Loan Request', description: 'Loan details' },
  { id: 5, title: 'Documents', description: 'Upload required files' },
  { id: 6, title: 'Review', description: 'Confirm all information' },
];

export function ApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      cin: '',
      address: '',
      city: '',
      delegation: '',
      zipCode: '',
    },
    employmentInfo: {
      employmentStatus: '',
      jobTitle: '',
      employer: '',
      industry: '',
      yearsEmployed: 0,
      monthlyIncome: 0,
    },
    financialInfo: {
      creditScore: 0,
      totalDebt: 0,
      monthlyExpenses: 0,
      savingsAmount: 0,
      assetValue: 0,
      bankruptcyHistory: false,
    },
    loanRequest: {
      loanAmount: 0,
      loanPurpose: '',
      loanTerm: 360,
    },
    documents: {
      payStubs: null as File | null,
      taxReturns: null as File | null,
      bankStatements: null as File | null,
      proofOfIdentity: null as File | null,
    },
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const app = await createApplication(formData as any);
      router.push(`/processing/${app.id}`);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    idx + 1 < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : idx + 1 === currentStep
                        ? 'bg-primary text-primary-foreground border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {idx + 1 < currentStep ? '✓' : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      idx + 1 < currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-foreground">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-8 mb-8">
          {currentStep === 1 && (
            <PersonalInfoStep
              data={formData.personalInfo}
              onChange={(field, value) =>
                handleInputChange('personalInfo', field, value)
              }
            />
          )}
          {currentStep === 2 && (
            <EmploymentStep
              data={formData.employmentInfo}
              onChange={(field, value) =>
                handleInputChange('employmentInfo', field, value)
              }
            />
          )}
          {currentStep === 3 && (
            <FinancialStep
              data={formData.financialInfo}
              onChange={(field, value) =>
                handleInputChange('financialInfo', field, value)
              }
            />
          )}
          {currentStep === 4 && (
            <LoanRequestStep
              data={formData.loanRequest}
              onChange={(field, value) =>
                handleInputChange('loanRequest', field, value)
              }
            />
          )}
          {currentStep === 5 && (
            <DocumentsStep
              data={formData.documents}
              onChange={(field, value) =>
                handleInputChange('documents', field, value)
              }
            />
          )}
          {currentStep === 6 && <ReviewStep data={formData} />}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex gap-4">
            {currentStep === STEPS.length ? (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 min-w-32"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalInfoStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="James"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Mitchell"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="james@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cin">CIN</Label>
          <Input
            id="cin"
            value={data.cin}
            onChange={(e) => onChange('cin', e.target.value)}
            placeholder="XXX-XX-XXXX"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="1247 Oak Street"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="San Francisco"
          />
        </div>
        <div>
          <Label htmlFor="delegation">Delegation</Label>
          <Input
            id="delegation"
            value={data.delegation}
            onChange={(e) => onChange('delegation', e.target.value)}
            placeholder="Ariana"
            maxLength="2"
          />
        </div>
        <div>
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={data.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            placeholder="94103"
          />
        </div>
      </div>
    </div>
  );
}

function EmploymentStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="employment">Employment Status</Label>
        <Select value={data.employmentStatus} onValueChange={(value) => onChange('employmentStatus', value)}>
          <SelectTrigger id="employment">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Employed">Employed</SelectItem>
            <SelectItem value="Self-Employed">Self-Employed</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
            <SelectItem value="Student">Student</SelectItem>
            <SelectItem value="Unemployed">Unemployed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={data.jobTitle}
            onChange={(e) => onChange('jobTitle', e.target.value)}
            placeholder="Senior Software Engineer"
          />
        </div>
        <div>
          <Label htmlFor="employer">Employer</Label>
          <Input
            id="employer"
            value={data.employer}
            onChange={(e) => onChange('employer', e.target.value)}
            placeholder="TechCorp Industries"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={data.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            placeholder="Technology"
          />
        </div>
        <div>
          <Label htmlFor="yearsEmployed">Years Employed</Label>
          <Input
            id="yearsEmployed"
            type="number"
            value={data.yearsEmployed}
            onChange={(e) => onChange('yearsEmployed', Number(e.target.value))}
            placeholder="7"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="income">Monthly Income ($)</Label>
        <Input
          id="income"
          type="number"
          value={data.monthlyIncome}
          onChange={(e) => onChange('monthlyIncome', Number(e.target.value))}
          placeholder="12500"
        />
      </div>
    </div>
  );
}

function FinancialStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="creditScore">Credit Score</Label>
        <Input
          id="creditScore"
          type="number"
          value={data.creditScore}
          onChange={(e) => onChange('creditScore', Number(e.target.value))}
          placeholder="745"
          min="300"
          max="850"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalDebt">Total Debt ($)</Label>
          <Input
            id="totalDebt"
            type="number"
            value={data.totalDebt}
            onChange={(e) => onChange('totalDebt', Number(e.target.value))}
            placeholder="45000"
          />
        </div>
        <div>
          <Label htmlFor="expenses">Monthly Expenses ($)</Label>
          <Input
            id="expenses"
            type="number"
            value={data.monthlyExpenses}
            onChange={(e) => onChange('monthlyExpenses', Number(e.target.value))}
            placeholder="4200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="savings">Savings Amount ($)</Label>
          <Input
            id="savings"
            type="number"
            value={data.savingsAmount}
            onChange={(e) => onChange('savingsAmount', Number(e.target.value))}
            placeholder="125000"
          />
        </div>
        <div>
          <Label htmlFor="assets">Asset Value ($)</Label>
          <Input
            id="assets"
            type="number"
            value={data.assetValue}
            onChange={(e) => onChange('assetValue', Number(e.target.value))}
            placeholder="350000"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bankruptcy"
          checked={data.bankruptcyHistory}
          onChange={(e) => onChange('bankruptcyHistory', e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <Label htmlFor="bankruptcy" className="mb-0">
          Have you had a bankruptcy in the past 7 years?
        </Label>
      </div>
    </div>
  );
}

function LoanRequestStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="loanAmount">Loan Amount ($)</Label>
        <Input
          id="loanAmount"
          type="number"
          value={data.loanAmount}
          onChange={(e) => onChange('loanAmount', Number(e.target.value))}
          placeholder="300000"
        />
      </div>

      <div>
        <Label htmlFor="purpose">Loan Purpose</Label>
        <Select value={data.loanPurpose} onValueChange={(value) => onChange('loanPurpose', value)}>
          <SelectTrigger id="purpose">
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Home Purchase">Home Purchase</SelectItem>
            <SelectItem value="Home Refinance">Home Refinance</SelectItem>
            <SelectItem value="Auto Purchase">Auto Purchase</SelectItem>
            <SelectItem value="Debt Consolidation">Debt Consolidation</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="term">Loan Term (months)</Label>
        <Select value={String(data.loanTerm)} onValueChange={(value) => onChange('loanTerm', Number(value))}>
          <SelectTrigger id="term">
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">5 years</SelectItem>
            <SelectItem value="180">15 years</SelectItem>
            <SelectItem value="360">30 years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function DocumentsStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  const documents = [
    {
      id: 'payStubs',
      label: 'Pay Stubs',
      description: 'Recent pay stubs (last 30 days)',
      accept: '.pdf,.doc,.docx,.jpg,.png',
    },
    {
      id: 'taxReturns',
      label: 'Tax Returns',
      description: 'Tax returns (last 2 years)',
      accept: '.pdf,.doc,.docx,.jpg,.png',
    },
    {
      id: 'bankStatements',
      label: 'Bank Statements',
      description: 'Bank statements (last 2 months)',
      accept: '.pdf,.doc,.docx,.jpg,.png',
    },
    {
      id: 'proofOfIdentity',
      label: 'Proof of Identity',
      description: 'Valid ID or passport',
      accept: '.pdf,.jpg,.png',
    },
  ];

  const handleFileChange = (fieldId: string, file: File | null) => {
    onChange(fieldId, file);
  };

  const handleRemoveFile = (fieldId: string) => {
    onChange(fieldId, null);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please upload the following documents to proceed:
      </p>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Label className="text-base font-semibold text-foreground">
                  {doc.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {doc.description}
                </p>
              </div>
              {data[doc.id] && (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>

            {data[doc.id] ? (
              <div className="flex items-center justify-between bg-muted p-4 rounded">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {data[doc.id].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(data[doc.id].size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(doc.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  accept={doc.accept}
                  onChange={(e) =>
                    handleFileChange(doc.id, e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </label>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground italic">
        Accepted file formats: PDF, DOC, DOCX, JPG, PNG. Maximum file size: 10 MB.
      </p>
    </div>
  );
}

function ReviewStep({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted rounded">
          <h4 className="font-semibold text-foreground mb-2">Personal Info</h4>
          <p className="text-sm text-muted-foreground">
            {data.personalInfo.firstName} {data.personalInfo.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{data.personalInfo.email}</p>
        </div>
        <div className="p-4 bg-muted rounded">
          <h4 className="font-semibold text-foreground mb-2">Employment</h4>
          <p className="text-sm text-muted-foreground">
            {data.employmentInfo.jobTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.employmentInfo.employer}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted rounded">
          <h4 className="font-semibold text-foreground mb-2">Financial</h4>
          <p className="text-sm text-muted-foreground">
            Credit Score: {data.financialInfo.creditScore}
          </p>
          <p className="text-sm text-muted-foreground">
            Savings: ${data.financialInfo.savingsAmount.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-muted rounded">
          <h4 className="font-semibold text-foreground mb-2">Loan Request</h4>
          <p className="text-sm text-muted-foreground">
            Amount: ${data.loanRequest.loanAmount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Purpose: {data.loanRequest.loanPurpose}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground italic">
        By submitting this application, you agree to our terms and conditions.
      </p>
    </div>
  );
}
