import { commonIcons, weatherIcon } from "@/assets";
import { Image } from "../ui/custom/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export function DashbaordNavbar() {
  const isMobile = useIsMobile();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${ampm} ${hours % 12 || 12}:${minutes}`;

      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setTime(formattedTime);
      setDate(formattedDate);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Main Container */}
      <div className="relative">
        {isMobile ? (
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src={commonIcons.dashboardBg}
              alt="dashboard background"
              objectFit="cover"
              width={450}
              height={850}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500">
            {/* Show date and time only when not mobile */}
            <div className="absolute top-3 right-[20%] sm:right-[20%] md:right-[20%] xl:right-[10%] text-white text-right flex justify-between items-center w-[20%] sm:w-[20%] md:w-[30%] xl:w-[15%]">
              <div>
              <div className="text-sm opacity-80">{date}</div>
              <div className="text-lg font-semibold">{time}</div>
              </div>
              <div>
              <div className="text-right flex items-center space-x-2">
                <div>
                  <div className="text-sm opacity-80 font-medium">Seoul</div>
                  <div className="text-sm">clear sky</div>
                  <div className="text-md font-bold">32°C</div>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Image
                    src={weatherIcon.weatherIcon01d}
                    alt="Weather"
                    width={40}
                    height={40}
                  />
                </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Navigation Bar */}
        <div className="relative flex justify-between items-center px-4 py-3">
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
          <div className="flex items-center space-x-4 pointer-events-auto">
            <Image
              src={commonIcons.languageIconEn}
              alt="language"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
            <Image
              src={commonIcons.homeIcon}
              alt="home"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
            <Image
              src={commonIcons.bellIcon}
              alt="notification"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
          </div>
        </div>
      </div>

      {/* Mobile Date, Time, and Weather */}
      {isMobile && (
        <div className="relative text-white px-6 py-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm opacity-80">{date}</div>
              <div className="text-lg font-semibold">{time}</div>
            </div>
            <div className="text-right flex items-center space-x-2">
              <div>
                <div className="text-sm opacity-80 font-medium">Seoul</div>
                <div className="text-sm">clear sky</div>
                <div className="text-md font-bold">32°C</div>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Image
                  src={weatherIcon.weatherIcon01d}
                  alt="Weather"
                  width={40}
                  height={40}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative px-4 py-2">
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
    </div>
  );
}
