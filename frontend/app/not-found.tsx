import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          Sorry, the page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </main>
  );
}
