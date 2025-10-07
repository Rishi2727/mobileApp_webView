import { dashboard } from "@/config/dashboard";
import DashboardCard from "@/features/dashboard/DashboardCard";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4">
      {dashboard.map((item) => (
        <DashboardCard
          key={item.path}
          title={item.title}
          path={item.path}
          image={item.image}
        />
      ))}
    </div>
  );
};

export default Dashboard;
