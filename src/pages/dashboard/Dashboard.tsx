import { ResponsiveContainer } from "@/components/layout/ResponsiveWrapper";
import { dashboard } from "@/config/dashboard";
import DashboardCard from "@/features/dashboard/DashboardCard";

const Dashboard = () => {
  return (
    <div className="relative h-screen overflow-hidden bg-primary-100 pb-10">
<div className="mt-[360px] sm:mt-[360px] md:mt-[420px] min-h-[500px] max-h-[calc(100vh-360px)] sm:max-h-[calc(100vh-360px)] md:max-h-[calc(100vh-420px)] overflow-y-auto m-2 bg-background rounded-2xl pb-10">
      <ResponsiveContainer>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {dashboard.map((item) => (
              <DashboardCard
                key={item.title+item.path}
                title={item.title}
                path={item.path}
                queryParams={item.queryParams}
                image={item.image}
                iconFillColor={item.iconFillColor}
                backgroundColor={item.backgroundColor}
                borderRadius={item.borderRadius}
                padding={item.padding}
                width={item.width}
                height={item.height}
                isExternal={item.isExternal}
                requiresSecret={item.requiresSecret}
                externalUrl={item.externalUrl}
              />
            ))}
          </div>
      </ResponsiveContainer>
        </div>
    </div>
  );
};

export default Dashboard;
