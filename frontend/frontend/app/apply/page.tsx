import { ApplicationProvider } from '@/lib/context/ApplicationContext';
import { ApplicationForm } from '@/components/forms/ApplicationForm';

export const metadata = {
  title: 'Apply for Loan | CreditAssess AI',
  description: 'Start your loan application with CreditAssess AI',
};

export default function ApplyPage() {
  return (
    <ApplicationProvider>
      <ApplicationForm />
    </ApplicationProvider>
  );
}
