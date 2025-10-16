import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useRoomTimePicker } from "@/store/RoomTimePicker";
import { useCategoryWiseRoomsStore } from "@/store/CategoryWiseRoomsStore";
import type { CategoryWiseAvailabilityRoom, RoomWiseDesk } from '@/store/api/ResponseModels';
import { useModelStore } from '@/store/ModelStore';
import { useBookingsStore } from '@/store/BookingsStore';
import { useSearchParams, useNavigate } from 'react-router';
import { useFavouriteSeatStore, maxFavouriteSeatsLimit } from '@/store/FavouriteSeat';
import { useLanguage } from '@/contexts/useLanguage';
import Text from '@/components/ui/custom/text';
import { Image } from '@/components/ui/custom/image';
import SwitchIcon from '@/assets/icons/switch.svg?react';
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";

// Import color constants to match old version exactly
const SEAT = {
  FIXED: '#9CA3AF',
  BOOKED: '#EF4444',
  AVAILABLE: '#10B981',
};

const TEXT = {
  DARK: '#1F2937',
  SECONDARY: '#6B7280',
  LIGHT: '#FFFFFF',
};

const BORDER = {
  MEDIUM: '#D1D5DB',
};

const SURFACE = {
  DEFAULT: '#FFFFFF',
  LIGHTER: '#F9FAFB',
};

const BRAND = {
  SECONDARY: '#3B82F6',
};

const SPECIFIC = {
  GOLD_STAR: '#FCD34D',
  SHADOW_BLACK: '#000000',
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

const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
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
  const { favouriteSeats, checkLimit, prependFavouriteSeat } = useFavouriteSeatStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const bookingId = searchParams.get('bookingId');
  const newFavourite = searchParams.get('newFavourite');

  // Calculate container dimensions based on screen width (matching old parseCoords)
  const screenWidth = window.innerWidth;

  const parseCoords = (coords: string) => {
    const [x1, y1, x2, y2] = coords.split(',').map(Number);
    const imageWidth = 1200, imageHeight = 800;
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
    if (!favouriteSeats.some(fav => fav.deskCode === desk.deskCode)) {
      if (checkLimit()) {
        newAlert({
          disableOnClick: true,
          message: `${t('seatSelection.areYouSureAddSeat')}${desk.deskNo}${t('seatSelection.toYourFavourites')}`,
          icon: 'question',
          buttons: [
            {
              title: t('common.yes'),
              onClickLoading: true,
              color: 'primary',
              onSuccess: () => {
                newAlert({
                  message: `${t('seatSelection.seatNo')} ${desk.deskNo}${t('seatSelection.hasBeenAddedToFavourites')}`,
                  icon: 'success',
                  buttons: [{
                    title: t('common.ok'),
                    action: () => {
                      // Match old routing: router.dismissAll() then router.dismissTo('/FavouriteSeat')
                      navigate('/settings-preferred-seat', { replace: true });
                    },
                    closeOnSuccess: true,
                    color: 'primary'
                  }],
                });
              },
              action: () => {
                prependFavouriteSeat({
                  deskCode: desk.deskCode,
                  deskName: desk.deskName,
                  deskNo: desk.deskNo,
                  room: room
                });
                return Promise.resolve({ msg: `Seat No. ${desk.deskNo} added to favourites.` });
              },
            },
            { title: t('common.no'), action: () => { }, color: 'secondary' }
          ],
        });
      } else {
        newAlert({
          message: `${t('favouriteSeat.canOnlyHaveUpTo')} ${maxFavouriteSeatsLimit} ${t('favouriteSeat.favouriteSeats')}`,
          icon: 'error',
          buttons: [{ title: t('common.ok'), action: () => { }, color: 'primary' }],
        });
      }
    }
  };

  const bookingAct = (desk: RoomWiseDesk) => {
    const bkId = (bookingId && bookingId !== '') ? bookingId : undefined;
    // Conditional favorite button logic matching old version exactly
    const favoriteBtn = (checkLimit() && !bkId && !favouriteSeats.some(fav => fav.deskCode === desk.deskCode));
    
    newAlert({
      disableOnClick: true,
      message: (!bkId) 
        ? `${t('seatSelection.areYouSureBookPrefix')} ${desk.deskNo}${t('seatSelection.areYouSureBookSuffix')}` 
        : `${t('seatSelection.areYouSureChangeSeatPrefix')}${desk.deskNo}${t('seatSelection.areYouSureChangeSeatSuffix')}`,
      icon: 'question',
      buttons: [
        {
          title: t('common.yes'),
          onClickLoading: true,
          color: 'primary',
          onFailure: (msg) => {
            newAlert({
              message: String(msg),
              icon: 'error',
              buttons: [
                {
                  title: t('common.ok'),
                  action: () => {
                    navigate(-1);
                  },
                  closeOnSuccess: true,
                  color: 'primary',
                }
              ]
            });
          },
          onSuccess: (result) => {
            let promptMessage = result?.msg || '';
            if (favoriteBtn) {
              promptMessage += "\n\n" + t('seatSelection.addSeatToFavourites');
            }
            newAlert({
              disableOnClick: true,
              message: promptMessage,
              icon: 'success',
              buttons: [
                {
                  hidden: !favoriteBtn,
                  title: t('common.yes'),
                  onSuccess: () => {
                    // Match old routing: router.replace({ pathname: '/BookingHistory', params })
                    navigate(`/bookings?bookingId=${result.data.bookingId}&catCode=${room.roomcatCode}`, { replace: true });
                  },
                  action: () => {
                    prependFavouriteSeat({
                      deskCode: desk.deskCode,
                      deskName: desk.deskName,
                      deskNo: desk.deskNo,
                      room: room
                    });
                    return Promise.resolve({ msg: `Seat No. ${desk.deskNo} added to favourites.` });
                  },
                  closeOnSuccess: true,
                  color: 'primary',
                },
                {
                  title: !favoriteBtn ? t('common.ok') : t('common.no'),
                  action: () => {
                    if (bkId) {
                      // Match old: router.canGoBack() && router.back()
                      navigate(-1);
                      return;
                    }
                    // Match old routing: router.replace({ pathname: '/BookingHistory', params })
                    navigate(`/bookings?bookingId=${result.data.bookingId}&catCode=${room.roomcatCode}`, { replace: true });
                  },
                  closeOnSuccess: true,
                  color: (!favoriteBtn) ? 'primary' : 'secondary',
                }
              ],
            });
          },
          action: async () => {
            let bk;
            if (bkId) {
              bk = await changeBooking(bkId, { reserveDeskCode: desk.deskCode, type: 'SEAT' });
            } else {
              bk = await createBooking({ reserveDeskCode: desk.deskCode, type: 'SEAT', bookingStartFromNow: true });
            }
            if (bk?.success) return Promise.resolve(bk);
            return Promise.reject(bk?.msg);
          },
          closeOnSuccess: true,
        },
        { title: t('common.no'), action: () => { }, color: 'secondary' }
      ],
    });
  };

  return (
    <>
      {seats.map((seat, idx) => {
        let isFavourite = false;
        if (favouriteSeats.some(fav => fav.deskCode === seat.deskCode)) {
          isFavourite = true;
        }
        const { top, left, width, height } = parseCoords(seat.deskCoords);
        
        return (
          <div
            key={idx}
            className="absolute flex items-center justify-center"
            style={{
              position: 'absolute',
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: getSeatColor(seat),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: `${scale(1)}px`,
            }}
          >
            {isFavourite && (
              <div
                style={{
                  position: 'absolute',
                  top: `${-scale(3)}px`,
                  right: `${-scale(3)}px`,
                  zIndex: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: `${scale(6)}px`,
                    color: SPECIFIC.GOLD_STAR,
                    textShadow: `0 1px 1px ${hexToRGBA(SPECIFIC.SHADOW_BLACK, 0.75)}`,
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
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                padding: `${scale(2)}px`,
              }}
            >
              <Text style={{ fontSize: `${scale(4)}px`, color: TEXT.LIGHT, fontWeight: 'bold' }}>
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
  
  const catCode = searchParams.get('catCode');
  const roomCode = searchParams.get('roomCode');
  const title = searchParams.get('title');
  const bookingId = searchParams.get('bookingId');
  const configSeatchange = searchParams.get('configSeatchange');
  
  const [mapFile, setMapFile] = useState<string | null>(null);
  const [mapFileName, setMapFileName] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [navMapFile, setNavMapFile] = useState<string | null>(null);
  const [navMapFileName, setNavMapFileName] = useState<string | null>(null);
  
  // Zoom and pan state matching ReactNativeZoomableView behavior
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { init, stopAndClear, DesksData } = useRoomTimePicker();
  const { getCachedFileUri } = useCategoryWiseRoomsStore();

  // Calculate screen dimensions matching old version
  const screenWidth = window.innerWidth;
  const heightOrg = (screenWidth * 800) / 1200;
  const widthOrg = screenWidth;

  useEffect(() => {
    const roomCodes = roomCode ? String(roomCode).split(',') : [];
    if (catCode === '' || roomCodes.length === 0) return;

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
        console.warn('Error fetching map file:', error);
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
        console.warn('Error fetching navigation map file:', error);
      }
    })();
  }, [getCachedFileUri, navMapFileName]);

  // Zoom handlers matching ReactNativeZoomableView behavior
  // maxZoom=4, minZoom=1, zoomStep=4, animatePin=true
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newZoom = Math.min(Math.max(1, zoom + delta), 4);
    setZoom(newZoom);
    
    // Reset position when zooming out to 1 (bindToBorders behavior)
    if (newZoom === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // bindToBorders: limit panning to image bounds
      const maxX = (widthOrg * (zoom - 1)) / 2;
      const maxY = (heightOrg * (zoom - 1)) / 2;
      
      setPosition({
        x: Math.min(Math.max(newX, -maxX), maxX),
        y: Math.min(Math.max(newY, -maxY), maxY),
      });
    }
  }, [isDragging, dragStart, zoom, widthOrg, heightOrg]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile (matching ReactNativeZoomableView)
  const getTouchDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      setIsPinching(true);
      setInitialPinchDistance(getTouchDistance(e.touches));
      setInitialZoom(zoom);
    } else if (e.touches.length === 1 && zoom > 1) {
      // Pan
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [zoom, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPinching && e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.min(Math.max(1, initialZoom * scale), 4);
      setZoom(newZoom);
      
      // Reset position when zooming out to 1
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (isDragging && e.touches.length === 1 && zoom > 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      // bindToBorders: limit panning to image bounds
      const maxX = (widthOrg * (zoom - 1)) / 2;
      const maxY = (heightOrg * (zoom - 1)) / 2;
      
      setPosition({
        x: Math.min(Math.max(newX, -maxX), maxX),
        y: Math.min(Math.max(newY, -maxY), maxY),
      });
    }
  }, [isDragging, isPinching, dragStart, zoom, initialPinchDistance, initialZoom, widthOrg, heightOrg]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsPinching(false);
  }, []);

  const handleChangeRoom = () => {
    // Match old: router.replace({ pathname: "/ticketing/RoomSelection", params })
    navigate(`/ticketing/RoomSelection?catCodes=${String(catCode)}&hideFloor=true${bookingId ? `&bookingId=${bookingId}` : ''}`, { replace: true });
  };

  // Helper for indicator colors
  const getSeatColor = (status: 'booked' | 'AVAILABLE' | 'fixed') => {
    switch (status) {
      case 'booked':
        return SEAT.BOOKED;
      case 'AVAILABLE':
        return SEAT.AVAILABLE;
      case 'fixed':
        return SEAT.FIXED;
      default:
        return SEAT.AVAILABLE;
    }
  };

  if (!DesksData?.rooms?.length || !mapFile || !navMapFile) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: SURFACE.DEFAULT }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: BRAND.SECONDARY }}></div>
      </div>
    );
  }

  const breadcrumbItems = metadata.ticketingSeatSelection?.breadcrumbItems || [];

  return (
    <div className="min-h-[90vh] bg-primary-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title={title || "Seat Selection"}
        showBackButton={true}
      />
      
      <div 
        className="flex-1 flex flex-col" 
        style={{ 
          backgroundColor: SURFACE.DEFAULT, 
          opacity: imageLoading ? 0 : 1,
          transition: 'opacity 200ms'
        }}
      >
      <div className="flex-1 flex flex-col" style={{ gap: `${scale(8)}px` }}>
        {/* Header */}
        <div 
          className="flex justify-between items-start" 
          style={{ 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            paddingTop: `${moderateVerticalScale(12)}px`, 
            paddingLeft: `${scale(8)}px`,
            paddingRight: `${scale(8)}px`
          }}
        >
          <div className="flex flex-col" style={{ gap: `${scale(4)}px` }}>
            <Text style={{ fontSize: `${moderateScale(12)}px`, color: TEXT.SECONDARY, fontWeight: 'bold' }}>
              {t(DesksData.rooms[0].roomName)}
            </Text>
          </div>
          {(bookingId && typeof bookingId === 'string' && bookingId !== '' && (!configSeatchange || (configSeatchange && typeof configSeatchange === 'string' && configSeatchange === 'SAME_CATEGORY'))) && (
            <button onClick={handleChangeRoom}>
              <div
                style={{
                  padding: `${scale(2)}px`,
                  margin: 0,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: BORDER.MEDIUM,
                  borderRadius: `${scale(8)}px`,
                  backgroundColor: SURFACE.LIGHTER,
                  paddingLeft: `${scale(8)}px`,
                  paddingRight: `${scale(8)}px`,
                }}
              >
                <div className="flex flex-col items-center" style={{ alignItems: 'center', gap: `${scale(1)}px` }}>
                  <SwitchIcon width={scale(16)} height={scale(16)} color={TEXT.DARK} />
                  <Text style={{ fontSize: '8px', color: TEXT.DARK }}>{t('seatSelection.changeRoom')}</Text>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Zoomable Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative select-none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <div
            style={{
              width: `${widthOrg}px`,
              height: `${heightOrg}px`,
              position: 'relative',
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging || isPinching ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <img
              ref={imageRef}
              src={mapFile}
              alt={mapFile || undefined}
              className="w-full h-full absolute"
              onLoadStart={() => setImageLoading(true)}
              onLoad={() => setTimeout(() => setImageLoading(false), 200)}
              style={{ 
                width: '100%', 
                height: '100%', 
                position: 'absolute',
                objectFit: 'contain'
              }}
            />
            <SeatBox seats={DesksData.rawData} room={DesksData.rooms[0]} />
          </div>
        </div>

        {/* Legend and Navigation Map */}
        <div 
          className="flex items-center justify-between" 
          style={{ 
            paddingLeft: `${scale(20)}px`, 
            paddingBottom: `${moderateVerticalScale(40)}px`, 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}
        >
          <div className="flex flex-col" style={{ gap: `${scale(1)}px` }}>
            <Indicator label={t('seatSelection.available')} color={getSeatColor('AVAILABLE')} />
            <Indicator label={t('seatSelection.inUse')} color={getSeatColor('booked')} />
            <Indicator label={t('seatSelection.fixed')} color={getSeatColor('fixed')} />
          </div>
          <Image
            src={navMapFile}
            alt="Navigation Map"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(error) =>
              console.warn('Error loading image:', error)
            }
          />
        </div>
      </div>
      </div>
    </div>
  );
};

const Indicator = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center" style={{ margin: `${scale(4)}px`, alignItems: 'center', gap: `${scale(4)}px` }}>
    <div style={{ width: `${scale(14)}px`, height: `${scale(14)}px`, borderRadius: `${scale(4)}px`, backgroundColor: color }} />
    <Text style={{ fontSize: `${moderateScale(10)}px` }}>{label}</Text>
  </div>
);

export default SeatSelectionScreen;
