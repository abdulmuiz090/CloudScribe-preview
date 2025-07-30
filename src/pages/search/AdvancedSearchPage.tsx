
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdvancedSearchInterface } from '@/components/search/AdvancedSearchInterface';

const AdvancedSearchPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Advanced Search</h1>
            <p className="text-muted-foreground mt-2">
              Discover content with powerful search and filtering capabilities
            </p>
          </div>
          
          <AdvancedSearchInterface />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdvancedSearchPage;
