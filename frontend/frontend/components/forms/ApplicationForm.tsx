"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  X,
  FileCheck,
  Loader2,
} from "lucide-react";
import { createApplication, getFormDefaults } from "@/lib/services/api";

interface Step {
  id: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Document Uploads",
    description: "Upload documents to verify income, identity, and financials.",
  },
  {
    id: 2,
    title: "Personal Information",
    description:
      "Basic identification and contact details to verify the borrower’s identity.",
  },
  {
    id: 3,
    title: "Loan Request Details",
    description: "Information about the loan the borrower is requesting.",
  },
  {
    id: 4,
    title: "Employment and Income",
    description:
      "Information about the borrower’s income stability and employment.",
  },
  {
    id: 5,
    title: "Credit & Financial Profile",
    description: "Detailed credit metrics required for risk modeling.",
  },
  {
    id: 6,
    title: "Housing Situation",
    description: "Borrower’s residential status.",
  },
];

const DiscriminatoryChip = () => (
  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
    Discriminatory
  </Badge>
);

export function ApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => getFormDefaults());

  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isOcrComplete, setIsOcrComplete] = useState(false);

  const hasUploadedDocument = useMemo(() => {
    return Boolean(formData.documents?.application);
  }, [formData.documents?.application]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (hasUploadedDocument) {
      setIsOcrProcessing(true);
      setIsOcrComplete(false);
      timer = setTimeout(() => {
        setIsOcrProcessing(false);
        setIsOcrComplete(true);
      }, 1500);
    } else {
      setIsOcrProcessing(false);
      setIsOcrComplete(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hasUploadedDocument]);

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
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDocumentStep = currentStep === 1;
  const isNextDisabled = isDocumentStep
    ? !hasUploadedDocument || !isOcrComplete
    : false;

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
                      ? "bg-primary text-primary-foreground"
                      : idx + 1 === currentStep
                        ? "bg-primary text-primary-foreground border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1 < currentStep ? "✓" : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      idx + 1 < currentStep ? "bg-primary" : "bg-border"
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
            <DocumentUploadsStep
              data={formData.documents}
              hasDocument={hasUploadedDocument}
              isProcessing={isOcrProcessing}
              isComplete={isOcrComplete}
              onChange={(field, value) =>
                handleInputChange("documents", field, value)
              }
            />
          )}
          {currentStep === 2 && (
            <PersonalInfoStep
              data={formData.personalInfo}
              onChange={(field, value) =>
                handleInputChange("personalInfo", field, value)
              }
            />
          )}
          {currentStep === 3 && (
            <LoanDetailsStep
              data={formData.loanDetails}
              onChange={(field, value) =>
                handleInputChange("loanDetails", field, value)
              }
            />
          )}
          {currentStep === 4 && (
            <EmploymentIncomeStep
              data={formData.employmentIncome}
              onChange={(field, value) =>
                handleInputChange("employmentIncome", field, value)
              }
            />
          )}
          {currentStep === 5 && (
            <CreditProfileStep
              data={formData.creditProfile}
              onChange={(field, value) =>
                handleInputChange("creditProfile", field, value)
              }
            />
          )}
          {currentStep === 6 && (
            <HousingSituationStep
              data={formData.housingInfo}
              onChange={(field, value) =>
                handleInputChange("housingInfo", field, value)
              }
            />
          )}
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
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-2"
                disabled={isNextDisabled}
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

function DocumentUploadsStep({
  data,
  onChange,
  hasDocument,
  isProcessing,
  isComplete,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
  hasDocument: boolean;
  isProcessing: boolean;
  isComplete: boolean;
}) {
  const documents = [
    {
      id: "application",
      label: "Application Package",
      description:
        "Upload a single PDF or image bundle with ID, income, and financial proofs for OCR.",
      placeholder: "Click or drag to upload your application package",
      accept: ".pdf,.doc,.docx,.jpg,.png",
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
        Upload at least one document to kick off OCR validation before moving
        on.
      </p>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-border rounded-lg p-6 bg-card"
          >
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
                    {doc.placeholder}
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
        Accepted file formats: PDF, DOC, DOCX, JPG, PNG. Maximum file size: 10
        MB.
      </p>

      <div className="pt-6 border-t border-border">
        <OcrProcessingStatus
          hasDocument={hasDocument}
          isProcessing={isProcessing}
          isComplete={isComplete}
        />
      </div>
    </div>
  );
}

function OcrProcessingStatus({
  hasDocument,
  isProcessing,
  isComplete,
}: {
  hasDocument: boolean;
  isProcessing: boolean;
  isComplete: boolean;
}) {
  let title = "Waiting for upload";
  let description = "Add your application PDF to trigger OCR validation.";
  let icon = <Upload className="w-5 h-5 text-muted-foreground" />;

  if (hasDocument && isProcessing) {
    title = "Running OCR pipeline";
    description = "We are extracting text to verify identity fields.";
    icon = <Loader2 className="w-5 h-5 text-primary animate-spin" />;
  } else if (hasDocument && isComplete) {
    title = "OCR complete";
    description = "Document looks good. You can proceed to the next section.";
    icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Badge variant={isComplete ? "secondary" : "outline"}>
        {isComplete ? "Ready" : isProcessing ? "Processing" : "Idle"}
      </Badge>
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
      <p className="text-muted-foreground">
        Basic identification and contact details to verify the borrower’s
        identity.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            required
            value={data.firstName ?? ""}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            required
            value={data.lastName ?? ""}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            required
            value={data.email ?? ""}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+216 XX XXX XXX"
            value={data.phone ?? ""}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="nationalId">National ID</Label>
          <Input
            id="nationalId"
            required
            value={data.nationalId ?? ""}
            onChange={(e) => onChange("nationalId", e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            required
            value={data.dateOfBirth ?? ""}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="streetAddress">Street Address</Label>
        <Input
          id="streetAddress"
          required
          value={data.streetAddress ?? ""}
          onChange={(e) => onChange("streetAddress", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-3">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            required
            value={data.city ?? ""}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="delegation">Delegation / State</Label>
          <Input
            id="delegation"
            required
            value={data.delegation ?? ""}
            onChange={(e) => onChange("delegation", e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            required
            value={data.postalCode ?? ""}
            onChange={(e) => onChange("postalCode", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function LoanDetailsStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  const loanPurposeOptions = [
    "Credit Card Refinancing",
    "Debt Consolidation",
    "Home Improvement",
    "Major Purchase",
    "Medical Expenses",
    "Moving Expenses",
    "Vacation or Travel",
    "Wedding Expenses",
    "Small Business Financing",
    "Renewable Energy Investment",
    "Other",
  ];

  const loanTermOptions = [
    { label: "12 months", value: 12 },
    { label: "60 months", value: 60 },
    { label: "180 months", value: 180 },
    { label: "360 months", value: 360 },
  ];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Information about the loan the borrower is requesting.
      </p>

      <div className="space-y-3">
        <Label
          htmlFor="loanAmountRequested"
          className="flex items-center gap-2"
        >
          Loan Amount Requested ($)
          <DiscriminatoryChip />
        </Label>
        <Input
          id="loanAmountRequested"
          type="number"
          min={0}
          required
          value={data.loanAmountRequested ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            onChange(
              "loanAmountRequested",
              value === "" ? null : Number(value),
            );
          }}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="loanTerm" className="flex items-center gap-2">
          Loan Term
          <DiscriminatoryChip />
        </Label>
        <Select
          value={
            data.loanTerm !== null && data.loanTerm !== undefined
              ? String(data.loanTerm)
              : undefined
          }
          onValueChange={(value) => onChange("loanTerm", Number(value))}
        >
          <SelectTrigger id="loanTerm">
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            {loanTermOptions.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="loanPurpose" className="flex items-center gap-2">
          Loan Purpose
          <DiscriminatoryChip />
        </Label>
        <Select
          value={data.loanPurpose || undefined}
          onValueChange={(value) => onChange("loanPurpose", value)}
        >
          <SelectTrigger id="loanPurpose">
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            {loanPurposeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function EmploymentIncomeStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Information about the borrower’s income stability and employment.
      </p>

      <div className="space-y-3">
        <Label htmlFor="employmentStatus">Employment Status</Label>
        <Select
          value={data.employmentStatus || undefined}
          onValueChange={(value) => onChange("employmentStatus", value)}
        >
          <SelectTrigger id="employmentStatus">
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
        <div className="space-y-3">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={data.jobTitle ?? ""}
            onChange={(e) => onChange("jobTitle", e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="employerName">Employer Name</Label>
          <Input
            id="employerName"
            value={data.employerName ?? ""}
            onChange={(e) => onChange("employerName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label
            htmlFor="yearsAtCurrentJob"
            className="flex items-center gap-2"
          >
            Years at Current Job
            <DiscriminatoryChip />
          </Label>
          <Input
            id="yearsAtCurrentJob"
            type="number"
            min={0}
            max={50}
            required
            value={data.yearsAtCurrentJob ?? ""}
            onChange={(e) =>
              onChange(
                "yearsAtCurrentJob",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="monthlyIncome" className="flex items-center gap-2">
            Monthly Income ($)
            <DiscriminatoryChip />
          </Label>
          <Input
            id="monthlyIncome"
            type="number"
            min={0}
            required
            value={data.monthlyIncome ?? ""}
            onChange={(e) =>
              onChange(
                "monthlyIncome",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="incomeVerificationStatus"
          className="flex items-center gap-2"
        >
          Income Verification Status
          <DiscriminatoryChip />
        </Label>
        <Select
          value={data.incomeVerificationStatus || undefined}
          onValueChange={(value) => onChange("incomeVerificationStatus", value)}
        >
          <SelectTrigger id="incomeVerificationStatus">
            <SelectValue placeholder="Select verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Verified">Not Verified</SelectItem>
            <SelectItem value="Source Verified">Source Verified</SelectItem>
            <SelectItem value="Fully Verified">Fully Verified</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CreditProfileStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  const numberField = (
    id: string,
    label: string,
    placeholder?: string,
    discriminatory?: boolean,
  ) => (
    <div className="space-y-3">
      <Label
        htmlFor={id}
        className={discriminatory ? "flex items-center gap-2" : undefined}
      >
        {label}
        {discriminatory && <DiscriminatoryChip />}
      </Label>
      <Input
        id={id}
        type="number"
        min={0}
        value={data[id] ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(id, e.target.value === "" ? null : Number(e.target.value))
        }
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Detailed credit metrics required for risk modeling (numeric features).
      </p>

      <div className="grid grid-cols-2 gap-4">
        {numberField(
          "openCreditAccounts",
          "Open Credit Accounts",
          "Number of currently active accounts",
          true,
        )}
        {numberField(
          "totalCreditAccounts",
          "Total Credit Accounts",
          "Total accounts ever opened (active & closed)",
          true,
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {numberField(
          "mortgageAccounts",
          "Number of Mortgage Accounts",
          "e.g., 0, 1, 2",
          true,
        )}
        {numberField(
          "recentDelinquencies",
          "Recent Delinquencies",
          "Times 30+ days late in the last 2 years",
          true,
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {numberField(
          "recentCreditInquiries",
          "Recent Credit Inquiries",
          "Inquiries in the past 6-12 months",
          true,
        )}
        {numberField(
          "totalRevolvingBalance",
          "Total Revolving Balance",
          "Current total balance on all credit cards",
          true,
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {numberField(
          "totalCurrentBalance",
          "Total Current Balance",
          "Combined balance of all loans and cards",
          true,
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="pastBankruptcy"
          checked={Boolean(data.pastBankruptcy)}
          onChange={(e) => onChange("pastBankruptcy", e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-border"
        />
        <Label
          htmlFor="pastBankruptcy"
          className="mb-0 flex items-center gap-2"
        >
          Have you filed for bankruptcy or had a tax lien?
          <DiscriminatoryChip />
        </Label>
      </div>
    </div>
  );
}

function HousingSituationStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  const options = [
    "Renting",
    "Owns Outright",
    "Mortgage",
    "Other",
    "No Ownership Information",
  ];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Borrower’s residential status.</p>
      <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        Home Ownership Status
        <DiscriminatoryChip />
      </Label>
      <RadioGroup
        value={data.homeOwnershipStatus || ""}
        onValueChange={(value) => onChange("homeOwnershipStatus", value)}
        className="space-y-3"
      >
        {options.map((option) => {
          const optionId = option.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <div
              key={option}
              className="flex items-center space-x-3 rounded border border-border p-3"
            >
              <RadioGroupItem value={option} id={optionId} required />
              <Label htmlFor={optionId} className="text-sm text-foreground">
                {option}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
