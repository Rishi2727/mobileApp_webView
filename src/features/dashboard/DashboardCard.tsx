import { Card } from "@/components/ui/card"
import { Icon, type IconName } from "@/components/ui/custom/icon"
import Text from "@/components/ui/custom/text"
import { Link } from "react-router"


const DashboardCard = ({ title, icon, path }: { title: string, icon: IconName, path: string }) => {
    return (
        <Card
            className="w-full"
        >
            <Link to={path}>
                <div className="flex flex-col items-center justify-center gap-4">
                    <Icon name={icon} size={24} />
                    <Text variant="subtitle">{title}</Text>
                </div>
            </Link>
        </Card>
    )
}

export default DashboardCard