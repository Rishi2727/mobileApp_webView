import { commonIcons } from "@/assets";
import { Icon } from "../ui/custom/icon";
import { Image } from "../ui/custom/image";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashbaordNavbar() {
    const isMobile = useIsMobile();

    return (
        <>
            {/* Main Container */}
            <div className="relative">
                {isMobile ? (
                    // Mobile View: Show dashboard background image
                    <div className="absolute inset-0 ">
                    <Image
                        src={commonIcons.dashboardBg}
                        alt="dashboard background"
                        objectFit="cover"

                    />
                    </div>
                ) : (
                    // Desktop/Web View: Gradient Background
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500"></div>
                )}

                {/* Top Navigation Bar */}
                <div className="relative flex justify-between items-center px-4 py-3">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Image
                            src={commonIcons.brandLogo}
                            alt="university Logo"
                            width={isMobile ? 170 : 300}
                            height={isMobile ? 40 : 60}
                            className="text-background"
                        />
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="text-white hover:text-gray-200 transition-colors">
                            <Icon name="Languages" size={isMobile ? 20 : 24} />
                        </button>
                        <button className="text-white hover:text-gray-200 transition-colors">
                            <Icon name="Home" size={isMobile ? 20 : 24} />
                        </button>
                        <button className="text-white hover:text-gray-200 transition-colors">
                            <Icon name="Bell" size={isMobile ? 20 : 24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Welcome Banner with Background Image */}
            <div className="relative px-4 py-6">
                <div className="flex justify-center items-center">
                    <Image
                        src={commonIcons.bannarImage}
                        alt="banner"
                        objectFit="fill"
                        width={isMobile ? 400 : 700}
                        height={isMobile ? 200 : 300}
                        className="w-full"
                    />
                </div>
            </div>
        </>
    );
}
