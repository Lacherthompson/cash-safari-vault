import { AuthenticatedNav } from '@/components/AuthenticatedNav';
import { useAuth } from '@/hooks/useAuth';

export default function Draft() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user && <AuthenticatedNav />}
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Draft Page</h1>
        <p className="text-muted-foreground">This page is for development only. Build your content here.</p>
        
        {/* Add your draft content below */}
        <div className="mt-8">
          
        </div>
      </main>
    </div>
  );
}
