
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';

const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <UserAnalyticsDashboard />
    </DashboardLayout>
  );
};

export default AnalyticsPage;
