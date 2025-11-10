import React, { useEffect, useCallback, useState, useRef } from "react";
import { useRoomTimePicker } from "@/store/RoomTimePicker";
import { useCategoryWiseRoomsStore } from "@/store/CategoryWiseRoomsStore";
import type {
  CategoryWiseAvailabilityRoom,
  RoomWiseDesk,
} from "@/store/api/ResponseModels";
import { useModelStore } from "@/store/ModelStore";
import { useBookingsStore } from "@/store/BookingsStore";
import { useSearchParams, useNavigate } from "react-router";
import {
  useFavouriteSeatStore,
  maxFavouriteSeatsLimit,
} from "@/store/FavouriteSeat";
import { useLanguage } from "@/contexts/useLanguage";
import Text from "@/components/ui/custom/text";
import { Image } from "@/components/ui/custom/image";
import SwitchIcon from "@/assets/icons/switch.svg?react";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { useNavbarHeight } from "@/hooks/useNavbarHeight";
import { useIsMobile } from "@/hooks/use-mobile";

const ANIMATION_CONFIG = {
  // Zoom Animation
  ZOOM: {
    MIN: 1,
    MAX: 3,
    STEP: 0.1,
    INITIAL: 1,
    MOMENTUM_MULTIPLIER: 0.95,
  },

  // Pan/Drag Animation
  PAN: {
    DURATION: 150,
    BOUNCE_DURATION: 120,
    MOMENTUM_MULTIPLIER: 0.8,
    BOUNCE_MARGIN: 0.1,
  },

  // Spring Animation
  SPRING: {
    TENSION: 0.08,
    DAMPING: 4,
    DURATION: 80,
  },

  // Transition
  TRANSITION: {
    DURATION: 150,
    EASING: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  },
};

// Base dimensions for scaling calculations
const BASE_DIMENSIONS = {
  WIDTH: 375,
  HEIGHT: 667,
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 800,
};

const SEAT = {
  FIXED: "#9CA3AF",
  BOOKED: "#EF4444",
  AVAILABLE: "#10B981",
};

const TEXT = {
  DARK: "#1F2937",
  SECONDARY: "#6B7280",
  LIGHT: "#FFFFFF",
};

const SURFACE = {
  DEFAULT: "#FFFFFF",
  LIGHTER: "#F9FAFB",
};

// const BRAND = {
//   SECONDARY: "#3B82F6",
// };

const SPECIFIC = {
  GOLD_STAR: "#FCD34D",
  SHADOW_BLACK: "#000000",
};

// Helper function to convert hex to RGBA (matching old implementation)
const hexToRGBA = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Scaling functions to match react-native-size-matters behavior
// Assuming a base width of 375 (iPhone 6/7/8 width)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

const scale = (size: number): number => {
  const width = window.innerWidth;
  return (width / BASE_WIDTH) * size;
};

const moderateVerticalScale = (size: number, factor: number = 0.5): number => {
  const height = window.innerHeight;
  const verticalScale = (height / BASE_HEIGHT) * size;
  return size + (verticalScale - size) * factor;
};

interface SeatBoxProps {
  seats: RoomWiseDesk[];
  room: CategoryWiseAvailabilityRoom;
}

const SeatBox: React.FC<SeatBoxProps> = ({ seats, room }) => {
  const { t } = useLanguage();
  const { newAlert } = useModelStore();
  const { createBooking, changeBooking } = useBookingsStore();
  const { favouriteSeats, checkLimit, prependFavouriteSeat } =
    useFavouriteSeatStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId");
  const newFavourite = searchParams.get("newFavourite");

  // Calculate container dimensions based on screen width (matching old parseCoords)
  const screenWidth = window.innerWidth;

  const parseCoords = (coords: string) => {
    const [x1, y1, x2, y2] = coords.split(",").map(Number);
    const imageWidth = BASE_DIMENSIONS.MAP_WIDTH;
    const imageHeight = BASE_DIMENSIONS.MAP_HEIGHT;
    const scaleX = screenWidth / imageWidth;
    const scaleY = (screenWidth * imageHeight) / imageWidth / imageHeight; // Matches old formula exactly
    return {
      top: y1 * scaleY,
      left: x1 * scaleX,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY,
    };
  };

  const getSeatColor = (seat: RoomWiseDesk) => {
    if (seat.isDeskFixed) return SEAT.FIXED;
    if (seat.isDeskBooked) return SEAT.BOOKED;
    return SEAT.AVAILABLE;
  };

  const handleClick = (desk: RoomWiseDesk) => {
    if (newFavourite) {
      addToFavourite(desk);
    } else {
      bookingAct(desk);
    }
  };

  const addToFavourite = (desk: RoomWiseDesk) => {
    if (!favouriteSeats.some((fav) => fav.deskCode === desk.deskCode)) {
      if (checkLimit()) {
        newAlert({
          disableOnClick: true,
          message: `${t("seatSelection.areYouSureAddSeat")}${desk.deskNo}${t(
            "seatSelection.toYourFavourites"
          )}`,
          icon: "question",
          buttons: [
            {
              title: t("common.yes"),
              onClickLoading: true,
              color: "primary",
              onSuccess: () => {
                newAlert({
                  message: `${t("seatSelection.seatNo")} ${desk.deskNo}${t(
                    "seatSelection.hasBeenAddedToFavourites"
                  )}`,
                  icon: "success",
                  buttons: [
                    {
                      title: t("common.ok"),
                      action: () => {
                        // Match old routing: router.dismissAll() then router.dismissTo('/FavouriteSeat')
                        navigate("/settings-preferred-seat", { replace: true });
                      },
                      closeOnSuccess: true,
                      color: "primary",
                    },
                  ],
                });
              },
              action: () => {
                prependFavouriteSeat({
                  deskCode: desk.deskCode,
                  deskName: desk.deskName,
                  deskNo: desk.deskNo,
                  room: room,
                });
                return Promise.resolve({
                  msg: `Seat No. ${desk.deskNo} added to favourites.`,
                });
              },
            },
            { title: t("common.no"), action: () => {}, color: "secondary" },
          ],
        });
      } else {
        newAlert({
          message: `${t(
            "favouriteSeat.canOnlyHaveUpTo"
          )} ${maxFavouriteSeatsLimit} ${t("favouriteSeat.favouriteSeats")}`,
          icon: "error",
          buttons: [
            { title: t("common.ok"), action: () => {}, color: "primary" },
          ],
        });
      }
    }
  };

  const bookingAct = (desk: RoomWiseDesk) => {
    const bkId = bookingId && bookingId !== "" ? bookingId : undefined;
    // Conditional favorite button logic matching old version exactly
    const favoriteBtn =
      checkLimit() &&
      !bkId &&
      !favouriteSeats.some((fav) => fav.deskCode === desk.deskCode);

    newAlert({
      disableOnClick: true,
      message: !bkId
        ? `${t("seatSelection.areYouSureBookPrefix")} ${desk.deskNo}${t(
            "seatSelection.areYouSureBookSuffix"
          )}`
        : `${t("seatSelection.areYouSureChangeSeatPrefix")}${desk.deskNo}${t(
            "seatSelection.areYouSureChangeSeatSuffix"
          )}`,
      icon: "question",
      buttons: [
        {
          title: t("common.yes"),
          onClickLoading: true,
          color: "primary",
          onFailure: (msg) => {
            newAlert({
              message: String(msg),
              icon: "error",
              buttons: [
                {
                  title: t("common.ok"),
                  action: () => {
                    navigate(-1);
                  },
                  closeOnSuccess: true,
                  color: "primary",
                },
              ],
            });
          },
          onSuccess: (result) => {
            let promptMessage = result?.msg || "";
            if (favoriteBtn) {
              promptMessage += "\n\n" + t("seatSelection.addSeatToFavourites");
            }
            newAlert({
              disableOnClick: true,
              message: promptMessage,
              icon: "success",
              buttons: [
                {
                  hidden: !favoriteBtn,
                  title: t("common.yes"),
                  onSuccess: () => {
                    // Match old routing: router.replace({ pathname: '/BookingHistory', params })
                    navigate(
                      `/bookings?bookingId=${result.data.bookingId}&catCode=${room.roomcatCode}`,
                      { replace: true }
                    );
                  },
                  action: () => {
                    prependFavouriteSeat({
                      deskCode: desk.deskCode,
                      deskName: desk.deskName,
                      deskNo: desk.deskNo,
                      room: room,
                    });
                    return Promise.resolve({
                      msg: `Seat No. ${desk.deskNo} added to favourites.`,
                    });
                  },
                  closeOnSuccess: true,
                  color: "primary",
                },
                {
                  title: !favoriteBtn ? t("common.ok") : t("common.no"),
                  action: () => {
                    if (bkId) {
                      // Match old: router.canGoBack() && router.back()
                      navigate(-1);
                      return;
                    }
                    // Match old routing: router.replace({ pathname: '/BookingHistory', params })
                    navigate(
                      `/bookings?bookingId=${result.data.bookingId}&catCode=${room.roomcatCode}`,
                      { replace: true }
                    );
                  },
                  closeOnSuccess: true,
                  color: !favoriteBtn ? "primary" : "secondary",
                },
              ],
            });
          },
          action: async () => {
            let bk;
            if (bkId) {
              bk = await changeBooking(bkId, {
                reserveDeskCode: desk.deskCode,
                type: "SEAT",
              });
            } else {
              bk = await createBooking({
                reserveDeskCode: desk.deskCode,
                type: "SEAT",
                bookingStartFromNow: true,
              });
            }
            if (bk?.success) return Promise.resolve(bk);
            return Promise.reject(bk?.msg);
          },
          closeOnSuccess: true,
        },
        { title: t("common.no"), action: () => {}, color: "secondary" },
      ],
    });
  };

  return (
    <>
      {seats.map((seat, idx) => {
        let isFavourite = false;
        if (favouriteSeats.some((fav) => fav.deskCode === seat.deskCode)) {
          isFavourite = true;
        }
        const { top, left, width, height } = parseCoords(seat.deskCoords);

        return (
          <div
            key={idx}
            className="absolute flex items-center justify-center"
            style={{
              position: "absolute",
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: getSeatColor(seat),
              justifyContent: "center",
              alignItems: "center",
              borderRadius: `${scale(1)}px`,
            }}
          >
            {isFavourite && (
              <div
                style={{
                  position: "absolute",
                  top: `${-scale(3)}px`,
                  right: `${-scale(3)}px`,
                  zIndex: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: `${scale(6)}px`,
                    color: SPECIFIC.GOLD_STAR,
                    textShadow: `0 1px 1px ${hexToRGBA(
                      SPECIFIC.SHADOW_BLACK,
                      0.75
                    )}`,
                  }}
                >
                  ★
                </Text>
              </div>
            )}
            <button
              onClick={() => handleClick(seat)}
              className="w-full h-full flex items-center justify-center"
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                padding: `${scale(2)}px`,
              }}
            >
              <Text
                style={{
                  fontSize: `${scale(4)}px`,
                  color: TEXT.LIGHT,
                  fontWeight: "bold",
                }}
              >
                {seat.deskNo}
              </Text>
            </button>
          </div>
        );
      })}
    </>
  );
};

const SeatSelectionScreen = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Calculate navbar height to ensure proper viewport usage
  const { remainingHeight } = useNavbarHeight("simple");

  const catCode = searchParams.get("catCode");
  const roomCode = searchParams.get("roomCode");
  const bookingId = searchParams.get("bookingId");
  const configSeatchange = searchParams.get("configSeatchange");

  const [mapFile, setMapFile] = useState<string | null>(null);
  const [mapFileName, setMapFileName] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [navMapFile, setNavMapFile] = useState<string | null>(null);
  const [navMapFileName, setNavMapFileName] = useState<string | null>(null);

  // Enhanced zoom and pan state with smooth animations
  const [zoom, setZoom] = useState(ANIMATION_CONFIG.ZOOM.INITIAL);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(ANIMATION_CONFIG.ZOOM.INITIAL);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastPanTime, setLastPanTime] = useState(0);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { init, stopAndClear, DesksData } = useRoomTimePicker();
  const { getCachedFileUri } = useCategoryWiseRoomsStore();
  const isMobile = useIsMobile();

  // Helper function for cursor style
  const getCursorStyle = () => {
    if (zoom <= 1) return "default";
    return isDragging ? "grabbing" : "grab";
  };

  // Calculate screen dimensions matching old version
  const screenWidth = window.innerWidth;
  const heightOrg = (screenWidth * 800) / 1200;
  const widthOrg = screenWidth;

  // Handle touch events with native event handlers
  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    // Wheel zoom handler
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) {
        // Only prevent default if it's not a ctrl+wheel (browser zoom)
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setZoom((prevZoom) => Math.min(Math.max(prevZoom + delta, 1), 3));
      }
    };

    // Touch event handlers
    const touchStartHandler = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        setIsPinching(true);
        setInitialPinchDistance(getTouchDistance(e.touches));
        setInitialZoom(zoom);
      } else if (e.touches.length === 1 && zoom > 1) {
        setIsDragging(true);
        setIsPinching(false);
        setIsInteracting(true);
        const touch = e.touches[0];
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
        setLastPanTime(Date.now());
        setLastPosition({ x: touch.clientX, y: touch.clientY });
        setVelocity({ x: 0, y: 0 });
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      if (isPinching && e.touches.length === 2) {
        const currentDistance = getTouchDistance(e.touches);
        const scale = currentDistance / initialPinchDistance;
        const newZoom = Math.min(Math.max(1, initialZoom * scale), 4);

        if (newZoom !== zoom) {
          const zoomFactor = newZoom / zoom;
          const rect = element.getBoundingClientRect();
          const center = {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
          };
          const relativeX = center.x - rect.width / 2;
          const relativeY = center.y - rect.height / 2;

          const newX = position.x - relativeX * (zoomFactor - 1);
          const newY = position.y - relativeY * (zoomFactor - 1);

          setZoom(newZoom);
          setPosition({
            x: Math.min(
              Math.max(newX, -(widthOrg * (newZoom - 1)) / 2),
              (widthOrg * (newZoom - 1)) / 2
            ),
            y: Math.min(
              Math.max(newY, -(heightOrg * (newZoom - 1)) / 2),
              (heightOrg * (newZoom - 1)) / 2
            ),
          });
        }
      } else if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;
        const now = Date.now();
        const elapsed = now - lastPanTime;

        if (elapsed > 0) {
          const velocityX = (touch.clientX - lastPosition.x) / elapsed;
          const velocityY = (touch.clientY - lastPosition.y) / elapsed;
          setVelocity({ x: velocityX, y: velocityY });
          setLastPosition({ x: touch.clientX, y: touch.clientY });
          setLastPanTime(now);
        }

        const maxX = (widthOrg * (zoom - 1)) / 2;
        const maxY = (heightOrg * (zoom - 1)) / 2;

        // Allow slight overscroll (20% beyond bounds)
        const overscrollFactor = 0.2;
        const overscrollX = maxX * overscrollFactor;
        const overscrollY = maxY * overscrollFactor;

        setPosition({
          x: Math.min(
            Math.max(newX, -(maxX + overscrollX)),
            maxX + overscrollX
          ),
          y: Math.min(
            Math.max(newY, -(maxY + overscrollY)),
            maxY + overscrollY
          ),
        });
      }
    };

    const touchEndHandler = () => {
      setIsPinching(false);
      setIsDragging(false);
      const maxX = (widthOrg * (zoom - 1)) / 2;
      const maxY = (heightOrg * (zoom - 1)) / 2;

      // Check if we need to bounce back (if we're beyond normal bounds)
      const needsBounceX = position.x < -maxX || position.x > maxX;
      const needsBounceY = position.y < -maxY || position.y > maxY;

      if (
        needsBounceX ||
        needsBounceY ||
        velocity.x !== 0 ||
        velocity.y !== 0
      ) {
        const momentum = {
          x: velocity.x * 150, // Increased momentum for more natural feel
          y: velocity.y * 150,
        };

        const targetX = position.x + momentum.x;
        const targetY = position.y + momentum.y;

        // Apply bounce effect - allow going 15% beyond bounds for smoother feel
        const bounceOvershoot = 0.15;
        const maxBounceX = maxX * (1 + bounceOvershoot);
        const maxBounceY = maxY * (1 + bounceOvershoot);

        // Calculate final positions with overshoot
        let overshootX = targetX;
        let overshootY = targetY;

        if (targetX > maxX) {
          overshootX = Math.min(targetX, maxBounceX);
        } else if (targetX < -maxX) {
          overshootX = Math.max(targetX, -maxBounceX);
        }

        if (targetY > maxY) {
          overshootY = Math.min(targetY, maxBounceY);
        } else if (targetY < -maxY) {
          overshootY = Math.max(targetY, -maxBounceY);
        }

        // Final constrained positions
        const finalX = Math.min(Math.max(overshootX, -maxX), maxX);
        const finalY = Math.min(Math.max(overshootY, -maxY), maxY);

        setIsAnimating(true);
        const startPosition = { ...position };
        const startTime = Date.now();

        // Single smooth animation with integrated bounce
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const totalDuration = 80;

          if (elapsed < totalDuration) {
            const progress = elapsed / totalDuration;

            // Custom easing function that combines momentum and bounce
            let eased;
            if (progress < 0.7) {
              // Initial momentum phase with smooth deceleration
              const t = progress / 0.7;
              eased = t * (2 - t); // Quadratic ease-out
            } else {
              // Bounce back phase with spring-like effect
              const t = (progress - 0.7) / 0.3;
              const springFactor =
                Math.cos(t * Math.PI * 1.5) * Math.exp(-t * 4);
              eased = 1 + springFactor * 0.08; // More subtle spring effect
            }

            // Calculate current position with smooth interpolation
            let currentX, currentY;

            if (progress < 0.7) {
              // Moving towards overshoot position
              currentX =
                startPosition.x + (overshootX - startPosition.x) * eased;
              currentY =
                startPosition.y + (overshootY - startPosition.y) * eased;
            } else {
              // Bouncing back to final position
              const t = (progress - 0.7) / 0.3;
              const smoothT = t * t * (3 - 2 * t); // Smooth step function
              currentX = overshootX + (finalX - overshootX) * smoothT;
              currentY = overshootY + (finalY - overshootY) * smoothT;
            }

            setPosition({ x: currentX, y: currentY });
            requestAnimationFrame(animate);
          } else {
            setPosition({ x: finalX, y: finalY });
            setIsAnimating(false);
            setVelocity({ x: 0, y: 0 });
          }
        };

        requestAnimationFrame(animate);
      } else {
        setVelocity({ x: 0, y: 0 });
      }
    };

    // Add event listeners with appropriate passive settings
    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", touchStartHandler, {
      passive: false,
    });
    element.addEventListener("touchmove", touchMoveHandler, { passive: false });
    element.addEventListener("touchend", touchEndHandler, { passive: true });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", touchStartHandler);
      element.removeEventListener("touchmove", touchMoveHandler);
      element.removeEventListener("touchend", touchEndHandler);
    };
  }, [
    zoom,
    position,
    initialPinchDistance,
    initialZoom,
    isDragging,
    isPinching,
    velocity,
    widthOrg,
    heightOrg,
  ]);

  useEffect(() => {
    const roomCodes = roomCode ? String(roomCode).split(",") : [];
    if (catCode === "" || roomCodes.length === 0) return;

    init({ roomCodes, catCode: String(catCode) });
    return () => stopAndClear();
  }, [catCode, init, roomCode, stopAndClear]);

  useEffect(() => {
    if (!DesksData?.rooms?.length) return;
    const room = DesksData.rooms[0];
    const mapFilePath = room.roomMap;
    const navMapFilePath = room.roomNavigationMap;

    if (!mapFileName || mapFileName !== mapFilePath) {
      setMapFileName(mapFilePath);
    }
    if (!navMapFileName || navMapFileName !== navMapFilePath) {
      setNavMapFileName(navMapFilePath);
    }
  }, [DesksData, mapFileName, navMapFileName]);

  useEffect(() => {
    if (!mapFileName) return;
    setMapFile(null);
    (async () => {
      try {
        const uri = await getCachedFileUri(mapFileName);
        setMapFile(uri);
      } catch (error) {
        console.warn("Error fetching map file:", error);
      }
    })();
  }, [getCachedFileUri, mapFileName]);

  useEffect(() => {
    if (!navMapFileName) return;
    setNavMapFile(null);
    (async () => {
      try {
        const uri = await getCachedFileUri(navMapFileName);
        setNavMapFile(uri);
      } catch (error) {
        console.warn("Error fetching navigation map file:", error);
      }
    })();
  }, [getCachedFileUri, navMapFileName]);

  // Enhanced wheel handling for smoother zooming
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // More responsive zoom delta - increased for faster zooming
      const delta = e.deltaY * -0.008; // Increased for faster zoom response
      const newZoom = Math.min(Math.max(1, zoom + delta), 4);

      // Get mouse position relative to container
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        setZoom(newZoom);
        return;
      }

      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      // Zoom towards mouse position
      if (newZoom !== zoom) {
        const zoomFactor = newZoom / zoom;
        const newX = position.x - mouseX * (zoomFactor - 1);
        const newY = position.y - mouseY * (zoomFactor - 1);

        // Apply boundary constraints
        const maxX = (widthOrg * (newZoom - 1)) / 2;
        const maxY = (heightOrg * (newZoom - 1)) / 2;

        setPosition({
          x: Math.min(Math.max(newX, -maxX), maxX),
          y: Math.min(Math.max(newY, -maxY), maxY),
        });
      }

      setZoom(newZoom);

      // Reset position when zooming out to 1 (bindToBorders behavior)
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
    },
    [zoom, position, widthOrg, heightOrg]
  );

  // Set up wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Enhanced pan handlers with momentum - optimized for live dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        e.preventDefault();
        setIsDragging(true);
        setIsInteracting(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        setLastPanTime(Date.now());
        setLastPosition({ x: e.clientX, y: e.clientY });
        setVelocity({ x: 0, y: 0 });
      }
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        e.preventDefault();

        // Direct update without requestAnimationFrame for immediate response
        const currentTime = Date.now();
        const timeDelta = currentTime - lastPanTime;

        if (timeDelta > 0) {
          const newVelocity = {
            x: (e.clientX - lastPosition.x) / timeDelta,
            y: (e.clientY - lastPosition.y) / timeDelta,
          };
          setVelocity(newVelocity);
        }

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Enhanced boundary checking with minimal elastic effect for faster response
        const maxX = (widthOrg * (zoom - 1)) / 2;
        const maxY = (heightOrg * (zoom - 1)) / 2;

        // Apply minimal elastic resistance for faster dragging
        let constrainedX = newX;
        let constrainedY = newY;

        if (newX > maxX) {
          const overshoot = newX - maxX;
          constrainedX = maxX + overshoot * 0.1; // Minimal resistance for faster feel
        } else if (newX < -maxX) {
          const overshoot = -maxX - newX;
          constrainedX = -maxX - overshoot * 0.1;
        }

        if (newY > maxY) {
          const overshoot = newY - maxY;
          constrainedY = maxY + overshoot * 0.1;
        } else if (newY < -maxY) {
          const overshoot = -maxY - newY;
          constrainedY = -maxY - overshoot * 0.1;
        }

        setPosition({ x: constrainedX, y: constrainedY });
        setLastPanTime(currentTime);
        setLastPosition({ x: e.clientX, y: e.clientY });
      }
    },
    [
      isDragging,
      dragStart,
      zoom,
      widthOrg,
      heightOrg,
      lastPanTime,
      lastPosition,
    ]
  );

  // Enhanced mouse up with momentum animation
  const handleMouseUp = useCallback(() => {
    if (isDragging && zoom > 1) {
      setIsDragging(false);
      setIsInteracting(false);

      // Apply momentum based on velocity - reduced for faster response
      const momentumMultiplier = 100; // Further reduced for snappier feel
      const momentumX = velocity.x * momentumMultiplier;
      const momentumY = velocity.y * momentumMultiplier;
      if (Math.abs(momentumX) > 10 || Math.abs(momentumY) > 10) {
        const finalX = position.x + momentumX;
        const finalY = position.y + momentumY;

        // Constrain to boundaries
        const maxX = (widthOrg * (zoom - 1)) / 2;
        const maxY = (heightOrg * (zoom - 1)) / 2;

        const constrainedFinalX = Math.min(Math.max(finalX, -maxX), maxX);
        const constrainedFinalY = Math.min(Math.max(finalY, -maxY), maxY);

        setIsAnimating(true);

        // Animate to final position - faster animation
        const startTime = Date.now();
        const startPosition = { ...position };

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const duration = 150; // Reduced for faster response

          if (elapsed < duration) {
            // Easing function (ease-out cubic)
            const t = elapsed / duration;
            const eased = 1 - (1 - t) ** 3;

            setPosition({
              x:
                startPosition.x + (constrainedFinalX - startPosition.x) * eased,
              y:
                startPosition.y + (constrainedFinalY - startPosition.y) * eased,
            });

            requestAnimationFrame(animate);
          } else {
            setPosition({ x: constrainedFinalX, y: constrainedFinalY });
            setIsAnimating(false);
          }
        };

        requestAnimationFrame(animate);
      }

      // Smooth bounce back to boundaries if exceeded
      const maxX = (widthOrg * (zoom - 1)) / 2;
      const maxY = (heightOrg * (zoom - 1)) / 2;

      if (
        position.x > maxX ||
        position.x < -maxX ||
        position.y > maxY ||
        position.y < -maxY
      ) {
        setIsAnimating(true);
        const targetX = Math.min(Math.max(position.x, -maxX), maxX);
        const targetY = Math.min(Math.max(position.y, -maxY), maxY);

        const startTime = Date.now();
        const startPosition = { ...position };

        const bounceAnimate = () => {
          const elapsed = Date.now() - startTime;
          const duration = 120; // Reduced for faster bounce

          if (elapsed < duration) {
            const t = elapsed / duration;
            // Smooth spring-like easing
            const eased = 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 2);

            setPosition({
              x: startPosition.x + (targetX - startPosition.x) * eased,
              y: startPosition.y + (targetY - startPosition.y) * eased,
            });

            requestAnimationFrame(bounceAnimate);
          } else {
            setPosition({ x: targetX, y: targetY });
            setIsAnimating(false);
          }
        };

        requestAnimationFrame(bounceAnimate);
      }
    } else {
      setIsDragging(false);
      setIsInteracting(false);
    }

    setVelocity({ x: 0, y: 0 });
  }, [isDragging, zoom, velocity, position, widthOrg, heightOrg]);

  // Enhanced mouse leave handler to ensure proper cleanup
  const handleMouseLeave = useCallback(() => {
    if (isDragging || isPinching) {
      handleMouseUp();
    }
  }, [isDragging, isPinching, handleMouseUp]);

  // Enhanced touch handlers for mobile with smooth animations
  // Helper functions that work with any touch list that has indexed access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTouchDistance = (touches: any): number => {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy); // Using Math.hypot for better performance
  };

  const handleChangeRoom = () => {
    navigate(
      `/ticketing/RoomSelection?catCodes=${String(catCode)}&hideFloor=true${
        bookingId ? `&bookingId=${bookingId}` : ""
      }`,
      { replace: true }
    );
  };

  // Helper for indicator colors
  const getSeatColor = (status: "booked" | "AVAILABLE" | "fixed") => {
    switch (status) {
      case "booked":
        return SEAT.BOOKED;
      case "AVAILABLE":
        return SEAT.AVAILABLE;
      case "fixed":
        return SEAT.FIXED;
      default:
        return SEAT.AVAILABLE;
    }
  };

  const breadcrumbItems = {
    "401,402": metadata.seatBookingPage,
    "402,401": metadata.seatBookingPage,
    "401": metadata.seatBookingPage,
    "402": metadata.seatBookingPage,
  };
  type BreadcrumbKeys = keyof typeof breadcrumbItems;
  // if (!DesksData?.rooms?.length || !mapFile || !navMapFile) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: SURFACE.DEFAULT }}>
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: BRAND.SECONDARY }}></div>
  //     </div>
  //   );
  // }
  return (
    <div
      className="w-screen overflow-hidden flex flex-col bg-primary-50"
      style={{ height: remainingHeight }}
    >
      <MyBreadcrumb
        items={
          breadcrumbItems[catCode as BreadcrumbKeys]?.breadcrumbItems ||
          metadata.ticketingSeatSelection?.breadcrumbItems ||
          []
        }
        title={
          breadcrumbItems[catCode as BreadcrumbKeys]?.title || "Seat Selection"
        }
        showBackButton={true}
      />
      {!DesksData?.rooms?.length || !mapFile || !navMapFile ? (
        <div className="flex flex-1 justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            backgroundColor: SURFACE.DEFAULT,
            opacity: imageLoading ? 0 : 1,
            transition: "opacity 200ms",
            width: "100vw",
            maxWidth: "100vw",
          }}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start p-2">
              <div className="flex flex-col">
                <Text className="text-primary-400 font-bold">
                  {t(DesksData.rooms[0].roomName)}
                </Text>
              </div>
              {bookingId &&
                typeof bookingId === "string" &&
                bookingId !== "" &&
                (!configSeatchange ||
                  (configSeatchange &&
                    typeof configSeatchange === "string" &&
                    configSeatchange === "SAME_CATEGORY")) && (
                  <button onClick={handleChangeRoom}>
                    <div
                    >
                      <div
                        className="flex flex-col items-center"
                        style={{ alignItems: "center", gap: `${scale(1)}px` }}
                      >
                        <SwitchIcon
                          width={scale(16)}
                          height={scale(16)}
                          color={TEXT.DARK}
                        />
                        <Text style={{ fontSize: "8px", color: TEXT.DARK }}>
                          {t("seatSelection.changeRoom")}
                        </Text>
                      </div>
                    </div>
                  </button>
                )}
            </div>

            {/* Zoomable Area */}
            <div
              ref={containerRef}
              className="flex-1 overflow-hidden relative select-none smooth-zoom-container custom-scroll"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: getCursorStyle(),
                touchAction: "none", // Prevent browser gestures,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="smooth-zoom-content"
                style={{
                  width: `${widthOrg}px`,
                  height: `${heightOrg}px`,
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition:
                    isInteracting || isDragging || isPinching || isAnimating
                      ? "none"
                      : `transform ${ANIMATION_CONFIG.TRANSITION.DURATION}ms ${ANIMATION_CONFIG.TRANSITION.EASING}`,
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                  perspective: 1000,
                }}
              >
                <img
                  ref={imageRef}
                  src={mapFile}
                  alt={mapFile || undefined}
                  className="w-full h-full absolute"
                  onLoad={() => setTimeout(() => setImageLoading(false), 200)}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    objectFit: "contain",
                  }}
                />
                <SeatBox seats={DesksData.rawData} room={DesksData.rooms[0]} />
              </div>
            </div>

            {/* Legend and Navigation Map */}
            <div
              className="seat flex items-center justify-between"
              style={{
                paddingLeft: `${scale(4)}px`,
                paddingRight: `${scale(4)}px`,
                paddingTop: `${moderateVerticalScale(2)}px`,
                paddingBottom: `${moderateVerticalScale(2)}px`,
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: "auto",
                height: "fit-content",
              }}
            >
              <div
                className={`flex ${
                  isMobile ? "flex-col pb-4" : "flex-row"
                } gap-1 `}
              >
                <Indicator
                  label={t("seatSelection.available")}
                  color={getSeatColor("AVAILABLE")}
                />
                <Indicator
                  label={t("seatSelection.inUse")}
                  color={getSeatColor("booked")}
                />
                <Indicator
                  label={t("seatSelection.fixed")}
                  color={getSeatColor("fixed")}
                />
              </div>
              <Image
                src={navMapFile}
                alt="Navigation Map"
                style={{
                  width: "15%",
                  maxWidth: "120px",
                  height: "auto",
                  objectFit: "contain",
                }}
                onError={(error) => console.warn("Error loading image:", error)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Indicator = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-1 mx-2">
    <div className="h-4 w-4" style={{ backgroundColor: color }} />
    <Text variant="caption" className="font-bold">
      {label}
    </Text>
  </div>
);

export default SeatSelectionScreen;
