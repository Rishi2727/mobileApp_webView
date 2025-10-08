import { ResponsiveContainer } from "@/components/layout/ResponsiveWrapper";
import { dashboard } from "@/config/dashboard";
import DashboardCard from "@/features/dashboard/DashboardCard";

const Dashboard = () => {
  return (
    <div className="relative h-screen overflow-hidden">
      <ResponsiveContainer>
        <div className="mt-[300px] sm:mt-[300px] md:mt-[420px]  min-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {dashboard.map((item) => (
              <DashboardCard
                key={item.path}
                title={item.title}
                path={item.path}
                image={item.image}
                iconFillColor={item.iconFillColor}
                backgroundColor={item.backgroundColor}
                borderRadius={item.borderRadius}
                padding={item.padding}
                width={item.width}
                height={item.height}
              />
            ))}
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
