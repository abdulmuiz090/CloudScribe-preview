
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchInterface } from '@/components/search/SearchInterface';

const SearchPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Search</h1>
            <p className="text-muted-foreground mt-2">
              Find products, blogs, templates, and more across the platform
            </p>
          </div>
          
          <SearchInterface />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
