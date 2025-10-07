import { commonIcons } from "@/assets";
import { Icon } from "../ui/custom/icon";
import { Image } from "../ui/custom/image";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashbaordNavbar() {
    const isMobile = useIsMobile();
    return (
        <>
        <div className="relative">
            <Image
                src={commonIcons.dashboardBg}
                alt="dashboard background"
                className="border border-black"
                objectFit="fill"

            />
            <div>
                <Image
                    src={commonIcons.bannarImage}
                    alt="banner"
                    objectFit="cover"
                    // width={isMobile ? 350 : 1200}
                    height={isMobile ? 250 : 300}
                    className="absolute top-20 left-1/2 transform -translate-x-1/2 p-4"
                />
            </div>
            </div>
            <div className="flex justify-between items-center w-full px-4 py-4  ">
                <div className="flex items-center space-x-0.5">
                    <Image
                        src={commonIcons.brandLogo}
                        alt="university Logo"
                        width={isMobile ? 170 : 300}
                        // className="text-background"
                    />
                </div>
                <div className="flex items-center space-x-4 ">
                    <Icon name="Languages" size={20} />
                    <Icon name="Home" size={20} />
                    <Icon name="Bell" size={20} />
                </div>
            </div>
        </>
    );
}
