'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateMockApplication, generateMockAssessmentResult } from '@/lib/services/api';
import type { Application } from '@/lib/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock applications on mount
  useEffect(() => {
    const apps = Array.from({ length: 12 }, (_, i) =>
      generateMockApplication(`app_${1000 + i}`)
    );
    const randomStatuses: (typeof apps[0]['status'])[] = [
      'submitted',
      'processing',
      'completed',
      'approved',
      'rejected',
    ];
    apps.forEach((app) => {
      app.status = randomStatuses[Math.floor(Math.random() * randomStatuses.length)];
    });
    setApplications(apps);
    setFilteredApplications(apps);
    setIsLoading(false);
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.personalInfo.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.personalInfo.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.personalInfo.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.id.includes(searchTerm)
      );
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const handleViewApplication = (id: string) => {
    router.push(`/results/${id}`);
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and review credit assessment applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Applications',
              value: applications.length,
              color: 'bg-blue-50',
            },
            {
              label: 'Approved',
              value: applications.filter((a) => a.status === 'approved').length,
              color: 'bg-green-50',
            },
            {
              label: 'Rejected',
              value: applications.filter((a) => a.status === 'rejected').length,
              color: 'bg-red-50',
            },
            {
              label: 'Processing',
              value: applications.filter((a) => a.status === 'processing').length,
              color: 'bg-yellow-50',
            },
          ].map((stat) => (
            <Card key={stat.label} className={`p-6 ${stat.color}`}>
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 p-0 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Applications Table */}
        <Card>
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Loan Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Credit Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-foreground">
                          {app.personalInfo.firstName} {app.personalInfo.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{app.id}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {app.personalInfo.email}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        ${(app.loanRequest.loanAmount / 1000).toFixed(0)}K
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {app.financialInfo.creditScore}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span className="capitalize">{app.status.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewApplication(app.id)}
                          className="gap-2"
                        >
                          View
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
}
