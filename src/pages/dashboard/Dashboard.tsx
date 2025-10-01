import { dashboard } from "@/config/dashboard"
import DashboardCard from "@/features/dashboard/dashboardCard"

const Dashboard = () => {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {dashboard.map((item) => (
                <DashboardCard key={item.path} title={item.title} icon={item.icon as any} path={item.path} />
            ))}
        </div>
    )
}

export default Dashboard