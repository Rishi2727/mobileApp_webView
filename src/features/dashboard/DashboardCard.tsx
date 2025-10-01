import DisplayWrapper from "@/components/core/wrapper/DisplayWrapper"
import { Icon, type IconName } from "@/components/ui/custom/icon"
import { Link } from "react-router"


const DashboardCard = ({ title, icon, path }: { title: string, icon: IconName, path: string }) => {
    return (
        <DisplayWrapper
            mode="card"
            size="full"

            className="w-full"
        >
            <Link to={path}>
                <div className="flex flex-col items-center gap-4">
                    <Icon name={icon} size={24} />
                    <div>{title}</div>
                </div>
            </Link>
        </DisplayWrapper>
    )
}

export default DashboardCard