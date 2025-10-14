import { commonIcons, weatherIcon } from "@/assets";
import { Image } from "../ui/custom/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useMainStore } from "@/store/MainStore";


// Weather icon mapping (matching your native implementation)
const weatherIconMap: Record<string, string> = {
  "01d": weatherIcon.weatherIcon01d,
  "01n": weatherIcon.weatherIcon01n,
  "02d": weatherIcon.weatherIcon02d,
  "02n": weatherIcon.weatherIcon02n,
  "03d": weatherIcon.weatherIcon03d,
  "03n": weatherIcon.weatherIcon03n,
  "04d": weatherIcon.weatherIcon04d,
  "04n": weatherIcon.weatherIcon04n,
  "09d": weatherIcon.weatherIcon09d,
  "09n": weatherIcon.weatherIcon09n,
  "10d": weatherIcon.weatherIcon10d,
  "10n": weatherIcon.weatherIcon10n,
  "11d": weatherIcon.weatherIcon11d,
  "11n": weatherIcon.weatherIcon11n,
  "13d": weatherIcon.weatherIcon13d,
  "13n": weatherIcon.weatherIcon13n,
  "50d": weatherIcon.weatherIcon50d,
  "50n": weatherIcon.weatherIcon50n,
};





export function DashbaordNavbar() {
  const isMobile = useIsMobile();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");


  // Get weather data and fetch function from store

  const currentWeather = useMainStore((state) => state.currentWeather);
  const fetchInitialData = useMainStore((state) => state.fetchInitialData);




  // Fetch weather data on component mount and set up auto-refresh
  useEffect(() => {
    fetchInitialData('A');
    // Auto-refresh every 10 minutes (600000ms)
    const weatherRefreshInterval = setInterval(() => {
      fetchInitialData('A');
    }, 600000);
    // Refresh when window regains focus (similar to AppState in native)
    const handleFocus = () => {
      fetchInitialData('A');
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(weatherRefreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchInitialData]);




  // Get weather icon source - with fallback
  const getWeatherIcon = () => {
    if (currentWeather?.weather?.[0]?.icon) {
      return weatherIconMap[currentWeather.weather[0].icon] || weatherIcon.weatherIcon01d;
    }
    return weatherIcon.weatherIcon01d;
  };

  // Get weather data with fallbacks
  const cityName = currentWeather?.name || "Seoul";
  const weatherDescription = currentWeather?.weather?.[0]?.description || "clear sky";
  const temperature = currentWeather?.main?.temp
    ? Math.round(currentWeather.main.temp)
    : null;
  const weatherIconSrc = getWeatherIcon();


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

              {/* Weather Section */}
              <div>
                <div className="text-right flex items-center space-x-2">
                  <div>
                    <div className="text-sm opacity-80 font-medium">{cityName}</div>
                    <div className="text-sm">{weatherDescription}</div>
                    <div className="text-md font-bold">    {temperature !== null ? `${temperature}°C` : ''}</div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Image
                      src={weatherIconSrc}
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
