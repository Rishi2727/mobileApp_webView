import { commonIcons } from "@/assets";
import moment from "moment";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import QRCode from "qrcode";
import Text from "../ui/custom/text";

// Size constants (converted from React Native scale to px)
const QR_SIZE = 180;
const STROKE_WIDTH = 20;
const RADIUS = QR_SIZE / 2 + 20;
const CIRCUMFERENCE = 2 * Math.PI * (RADIUS - STROKE_WIDTH);

type QRViewComponentProps = {
  qrData: string | null | undefined;
  generatedAt: string | null | undefined;
  expireAt: string | null | undefined;
  onRefresh: () => void;
  qrTimeRange: string | null | undefined;
  handleLogout?: null | (() => void);
  page?: "PROFILE" | "EXTERNAL_USER" | "SHAKE_MODEL";
  textColor?: string;
  t: (key: string) => string;
};

export const QRViewComponent: React.FC<QRViewComponentProps> = ({
  qrData,
  generatedAt,
  expireAt,
  onRefresh,
  qrTimeRange,
  handleLogout = null,
  page = "PROFILE",
  textColor,
  t,
}) => {
  const qrDuration = useRef<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const animationStartTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [timeRange, setTimeRange] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");


  useEffect(() => {
    window.ReactNativeWebView?.postMessage(JSON.stringify({ cmd: "CapturePrevent", value : true }));

    return () => {
      setTimeout(() => {
        window.ReactNativeWebView?.postMessage(JSON.stringify({ cmd: "CapturePrevent", value : false }));
      }, 200);
    };
  }, []);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const calculateTimeLeft = useCallback(() => {
    if (!generatedAt || !expireAt) return 0;

    const now = moment();
    const genTime = moment(generatedAt);
    const expTime = moment(expireAt);

    if (!genTime.isValid() || !expTime.isValid()) return 0;

    const elapsed = now.diff(genTime, "seconds");
    const duration = expTime.diff(genTime, "seconds");
    const left = duration - elapsed;

    return Math.max(0, left);
  }, [generatedAt, expireAt]);

  // Generate QR Code on canvas
  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        // Generate QR code
        await QRCode.toCanvas(canvas, qrData || "I like curious people", {
          width: QR_SIZE * 0.65,
          margin: 0,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // Load and draw logo
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = commonIcons.qrLogo;

        logo.onload = () => {
          const logoSize = QR_SIZE * 0.65 * 0.23;
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = (canvas.height - logoSize) / 2;

          // Draw white background circle for logo
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            logoSize / 2 + 5,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Draw logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            logoSize / 2,
            0,
            Math.PI * 2
          );
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        };
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();
  }, [qrData]);

  const startTimer = useCallback(() => {
    cleanup(); // Clear any existing timers

    if (!qrData || !generatedAt || !expireAt) {
      timeoutRef.current = setTimeout(onRefresh, 500);
      return;
    }

    const genTime = moment(generatedAt);
    const expTime = moment(expireAt);

    if (!genTime.isValid() || !expTime.isValid()) {
      timeoutRef.current = setTimeout(onRefresh, 500);
      return;
    }

    const duration = expTime.diff(genTime, "seconds");
    const left = calculateTimeLeft();

    if (duration <= 0 || left <= 0) {
      setTimeRemaining("Expired");
      timeoutRef.current = setTimeout(onRefresh, 500);
      return;
    }

    qrDuration.current = duration;
    setTimeLeft(left);

    // Calculate initial progress based on elapsed time
    const elapsedTime = duration - left;
    const initialProgress = elapsedTime / duration;
    setProgress(initialProgress);

    // Store animation start time
    animationStartTimeRef.current = Date.now();

    // Animate progress smoothly using requestAnimationFrame
    const animate = () => {
      const currentLeft = calculateTimeLeft();
      if (currentLeft >= 0) {
        const currentDuration = qrDuration.current;
        const newProgress = (currentDuration - currentLeft) / currentDuration;
        setProgress(newProgress);
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    // Start the countdown interval for time display
    intervalRef.current = setInterval(() => {
      const currentLeft = calculateTimeLeft();
      if (currentLeft >= 0) {
        setTimeLeft(currentLeft);

        if (currentLeft <= 0) {
          setTimeRemaining("Expired");
        } else {
          const duration = moment.duration(currentLeft, "seconds");
          const days = duration.days();
          const hours = String(duration.hours()).padStart(2, "0");
          const minutes = String(duration.minutes()).padStart(2, "0");
          const seconds = String(duration.seconds()).padStart(2, "0");

          if (days > 0) {
            setTimeRemaining(
              `${days}${t("common.days")} ${hours}${t(
                "common.hours"
              )} ${minutes}${t("common.minutes")} ${seconds}${t(
                "common.seconds"
              )}`
            );
          } else if (duration.hours() > 0) {
            setTimeRemaining(
              `${hours}${t("common.hours")} ${minutes}${t(
                "common.minutes"
              )} ${seconds}${t("common.seconds")}`
            );
          } else if (duration.minutes() > 0) {
            setTimeRemaining(
              `${minutes}${t("common.minutes")} ${seconds}${t(
                "common.seconds"
              )}`
            );
          } else if (duration.seconds() > 0 && days === 0) {
            setTimeRemaining(`${seconds}${t("common.seconds")}`);
          }
        }
      }
      if (currentLeft <= 0) {
        console.log("QR expired, refreshing...");
        cleanup();
        onRefresh();
      }
    }, 1000);
  }, [cleanup, qrData, generatedAt, expireAt, calculateTimeLeft, onRefresh, t]);

  // Memoize time range regex to avoid recreating on each render
  const timeRangeRegex = useMemo(
    () =>
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
    []
  );

  // Reset progress when QR data changes (like the React Native version)
  useEffect(() => {
    setProgress(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [qrData, generatedAt, expireAt]);

  // Process time range with memoization
  const processedTimeRange = useMemo(() => {
    if (!qrTimeRange) return null;
    if (
      timeRangeRegex.test(qrTimeRange) &&
      qrTimeRange !== "00:00:00-00:00:00"
    ) {
      return qrTimeRange;
    }
    return null;
  }, [qrTimeRange, timeRangeRegex]);

  // Update time range state when processed value changes
  useEffect(() => {
    setTimeRange(processedTimeRange);
  }, [processedTimeRange]);

  // Start timer when component mounts or data changes
  useEffect(() => {
    startTimer();
    return () => {
      cleanup();
    };
  }, [startTimer, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Calculate stroke dash offset for progress (matching React Native logic)
  // In the original: strokeDashoffset goes from 0 to CIRCUMFERENCE as time passes
  const strokeDashoffset = progress * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: RADIUS * 2,
          height: RADIUS * 2,
        }}
      >
        {handleLogout !== null && (
          <button
            onClick={handleLogout}
            className="absolute top-0 right-2.5 z-999 w-8 h-8 cursor-pointer"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          >
            <commonIcons.LogoutIcon
              className="w-full h-full"
            />
          </button>
        )}

        {/* Progress Circle */}
        <svg width={RADIUS * 2} height={RADIUS * 2} className="absolute">
          {/* Background circle */}
          <circle
            cx={RADIUS}
            cy={RADIUS}
            r={RADIUS - STROKE_WIDTH}
            stroke="rgba(0, 0, 0, 0.1)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={RADIUS}
            cy={RADIUS}
            r={RADIUS - STROKE_WIDTH}
            stroke="white"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${RADIUS} ${RADIUS})`}
          />
        </svg>

        {/* QR Code Container */}
        <div
          className="absolute flex items-center justify-center bg-white rounded-full shadow-lg"
          style={{
            width: QR_SIZE,
            height: QR_SIZE,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ opacity: !!qrData && timeLeft > 2 ? 1 : 0.1 }}>
            <canvas
              ref={canvasRef}
              width={QR_SIZE * 0.65}
              height={QR_SIZE * 0.65}
            />
          </div>
        </div>
      </div>

      {/* Timer Display for EXTERNAL_USER */}
      {expireAt && timeRemaining && page === "EXTERNAL_USER" && (
        <Text
          className="text-center mb-4"
          style={{
            fontSize: "12px",
            color:
              timeRemaining === "Expired" ? "#EF4444" : textColor || "#4F8DFB",
            fontWeight: timeRemaining === "Expired" ? "600" : "400",
          }}
        >
          {timeRemaining === "Expired"
            ? t("externalUser.qrExpired")
            : `${t("profile.remainingTime")}: ${timeRemaining}`}
        </Text>
      )}

      {/* Timer Display for other pages */}
      {expireAt && timeRemaining && page !== "EXTERNAL_USER" && (
        <div className="mt-2">
          <Text
            className="mb-1"
            style={{
              fontSize: "16px",
              color: textColor || "#D1D5DB",
              textAlign: "center",
            }}
          >
            {t("profile.remainingTime")}
          </Text>
          <Text
            className="font-bold"
            style={{
              fontSize: "24px",
              color: textColor || "#D1D5DB",
            }}
          >
            {timeLeft > 0 ? `${timeLeft} ${t("profile.seconds")}` : ""}
          </Text>
        </div>
      )}

      {/* Time Range Display */}
      {timeRange && (
        <p
          className="text-center"
          style={{ fontSize: "12px", color: "#4F8DFB" }}
        >
          {(() => {
            const [start, end] = timeRange.split("-");
            const startMoment = moment(start, "HH:mm:ss");
            const endMoment = moment(end, "HH:mm:ss");
            return t("externalUser.canUseInTimeRange")
              .replace("{start}", startMoment.format("hh:mm A"))
              .replace("{end}", endMoment.format("hh:mm A"));
          })()}
        </p>
      )}
    </div>
  );
};
