import { commonIcons, weatherIcon } from "@/assets";
import { Image } from "../ui/custom/image";
import { useIsMobile } from "@/hooks/use-mobile";
import BrandLogo from "@/assets/icons/brandLogo.svg?react";
import { useEffect, useState, useRef } from "react";
import { useMainStore } from "@/store/MainStore";
import { DATE_FORMATS, formatDate } from "@/lib/dateUtils";
import { LanguageToggle } from "@/features/language-toggle/languageToggle";
import { useLanguage } from "@/contexts/useLanguage";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

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
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentWeather = useMainStore((state) => state.currentWeather);
  const fetchInitialData = useMainStore((state) => state.fetchInitialData);
  const visibleBanners = useMainStore((state) => state.sliders);
  
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData("A");
    const weatherRefreshInterval = setInterval(() => {
      fetchInitialData("A");
    }, 600000);

    const handleFocus = () => {
      fetchInitialData("A");
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(weatherRefreshInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchInitialData]);

  const getWeatherIcon = () => {
    if (currentWeather?.weather?.[0]?.icon) {
      return (
        weatherIconMap[currentWeather.weather[0].icon] ||
        weatherIcon.weatherIcon01d
      );
    }
    return weatherIcon.weatherIcon01d;
  };

  const cityName = currentWeather?.name || "Seoul";
  const weatherDescription =
    currentWeather?.weather?.[0]?.description || "clear sky";
  const temperature = currentWeather?.main?.temp
    ? Math.round(currentWeather.main.temp)
    : null;
  const weatherIconSrc = getWeatherIcon();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDate(formatDate(now, DATE_FORMATS.LONG_DATE));
      setTime(formatDate(now, DATE_FORMATS.LONG_TIME));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  const handleLanguageToggle = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  // Auto-scroll carousel
  useEffect(() => {
    if (visibleBanners.length <= 1) return;

    const slideTimer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % visibleBanners.length;
        
        // Scroll to next slide
        if (carouselRef.current) {
          const container = carouselRef.current;
          const slideWidth = container.offsetWidth;
          container.scrollTo({
            left: slideWidth * nextIndex,
            behavior: "smooth",
          });
        }
        
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(slideTimer);
  }, [visibleBanners.length]);

  return (
    <div className="fixed top-0 left-0 w-full z-50 pb-8">
      {/* Main Container */}
      <div className="relative pb-3">
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
          <div className="absolute inset-0 bg-linear-to-b from-slate-700 via-slate-600 to-slate-500">
            {/* Show date and time only when not mobile */}
            <div className="header absolute top-3 right-[20%] sm:right-[20%] md:right-[20%] xl:right-[10%] text-white text-right flex justify-between items-center w-[20%] sm:w-[20%] md:w-[30%] xl:w-[15%]">
              <div>
                <div className="text-sm opacity-80">{date}</div>
                <div className="text-lg font-semibold">{time}</div>
              </div>

              {/* Weather Section */}
              <div>
                <div className="text-right flex items-center space-x-2">
                  <div>
                    <div className="text-sm opacity-80 font-medium">
                      {t(cityName)}
                    </div>
                    <div className="text-sm">{t(weatherDescription)}</div>
                    <div className="text-md font-bold">
                      {" "}
                      {temperature !== null ? `${temperature}°C` : ""}
                    </div>
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
            <BrandLogo
              width={isMobile ? 170 : 300}
              height={isMobile ? 40 : 60}
              className="logo text-background"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 pointer-events-auto">
            <LanguageToggle onToggle={handleLanguageToggle} />
            <commonIcons.HomeIcon
              onClick={() => navigate("/")}
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background cursor-pointer"
            />
            <commonIcons.BellIcon
              onClick={() => navigate("/messages")}
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background cursor-pointer"
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
                <div className="text-sm opacity-80 font-medium">{t(cityName)}</div>
                <div className="text-sm">{t(weatherDescription)}</div>
                <div className="text-md font-bold">
                  {temperature !== null ? `${temperature}°C` : ""}
                </div>
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
      )}

      {/* Welcome Banner Carousel - Only show if banners are available */}
      {visibleBanners.length > 0 && (
        <div className="relative px-4 pt-2 pb-4">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-lg mb-2">
            <div
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
              style={{
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
              }}
              onScroll={(e) => {
                const container = e.currentTarget;
                const slideWidth = container.offsetWidth;
                const scrollLeft = container.scrollLeft;
                const index = Math.round(scrollLeft / slideWidth);
                if (index !== currentIndex) {
                  setCurrentIndex(index);
                }
              }}
            >
              {visibleBanners.map((banner) => (
                <div
                  key={banner.seq}
                  className="shrink-0 w-full snap-center flex justify-center items-center select-none"
                >
                  <img
                    src={`data:image/png;base64,${banner.fileimage}`}
                    alt="banner"
                    className="rounded-lg object-contain w-full pointer-events-none"
                    style={{
                      maxWidth: isMobile ? "400px" : "700px",
                      height: isMobile ? "200px" : "300px",
                    }}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators - Only show if more than 1 banner */}
          {visibleBanners.length > 1 && (
            <div className="flex justify-center items-center space-x-3">
              {visibleBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    if (carouselRef.current) {
                      const slideWidth = carouselRef.current.offsetWidth;
                      carouselRef.current.scrollTo({
                        left: slideWidth * index,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-slate-800 h-2.5 w-10 shadow-lg"
                      : "bg-slate-400/60 h-2.5 w-2.5 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
