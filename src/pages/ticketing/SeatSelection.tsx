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
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/custom/image';
import switchIcon from '@/assets/icons/switch.svg';

// Seat color constants matching the old code
const SEAT_COLORS = {
  FIXED: '#9CA3AF',
  BOOKED: '#EF4444',
  AVAILABLE: '#10B981',
};

interface SeatBoxProps {
  seats: RoomWiseDesk[];
  room: CategoryWiseAvailabilityRoom;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
}

const SeatBox: React.FC<SeatBoxProps> = ({ seats, room, imageWidth, imageHeight, containerWidth, containerHeight }) => {
  const { t } = useLanguage();
  const { newAlert } = useModelStore();
  const { createBooking, changeBooking } = useBookingsStore();
  const { favouriteSeats, checkLimit, prependFavouriteSeat } = useFavouriteSeatStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const bookingId = searchParams.get('bookingId');
  const newFavourite = searchParams.get('newFavourite');

  const parseCoords = (coords: string) => {
    const [x1, y1, x2, y2] = coords.split(',').map(Number);
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    return {
      top: y1 * scaleY,
      left: x1 * scaleX,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY,
    };
  };

  const getSeatColor = (seat: RoomWiseDesk) => {
    if (seat.isDeskFixed) return SEAT_COLORS.FIXED;
    if (seat.isDeskBooked) return SEAT_COLORS.BOOKED;
    return SEAT_COLORS.AVAILABLE;
  };

  const handleClick = (desk: RoomWiseDesk) => {
    if (newFavourite) {
      addToFavourite(desk);
    } else if (!desk.isDeskFixed && !desk.isDeskBooked) {
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
                      navigate('/settings-preferred-seat');
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
                    navigate(`/bookings?bookingId=${result.data.bookingId}&catCode=${room.roomcatCode}`);
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
                      navigate(-1);
                      return;
                    }
                    navigate(`/bookings?bookingId=${result.data.bookingId}&catCode=${room.roomcatCode}`);
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
        const isFavourite = favouriteSeats.some(fav => fav.deskCode === seat.deskCode);
        const { top, left, width, height } = parseCoords(seat.deskCoords);
        
        return (
          <div
            key={idx}
            className="absolute flex items-center justify-center"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: getSeatColor(seat),
              borderRadius: '2px',
            }}
          >
            {isFavourite && (
              <div className="absolute -top-1 -right-1 z-10">
                <Text
                  className="text-yellow-400"
                  style={{
                    fontSize: '12px',
                    textShadow: '0 1px 1px rgba(0, 0, 0, 0.75)',
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
                padding: '4px',
              }}
            >
              <Text className="text-white font-bold" style={{ fontSize: '8px' }}>
                {seat.deskNo}
              </Text>
            </button>
          </div>
        );
      })}
    </>
  );
};

const Indicator = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-2 m-1">
    <div 
      className="rounded"
      style={{ 
        width: '28px', 
        height: '28px', 
        backgroundColor: color 
      }} 
    />
    <Text style={{ fontSize: '12px' }}>{label}</Text>
  </div>
);

const SeatSelectionScreen = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const catCode = searchParams.get('catCode');
  const roomCode = searchParams.get('roomCode');
  const bookingId = searchParams.get('bookingId');
  const configSeatchange = searchParams.get('configSeatchange');
  
  const [mapFile, setMapFile] = useState<string | null>(null);
  const [mapFileName, setMapFileName] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [navMapFile, setNavMapFile] = useState<string | null>(null);
  const [navMapFileName, setNavMapFileName] = useState<string | null>(null);
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { init, stopAndClear, DesksData } = useRoomTimePicker();
  const { getCachedFileUri } = useCategoryWiseRoomsStore();

  // Container dimensions
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const imageWidth = 1200;
  const imageHeight = 800;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = (width * imageHeight) / imageWidth;
        setContainerDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const roomCodes = roomCode ? String(roomCode).split(',') : [];
    if (!catCode || roomCodes.length === 0) return;

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

  // Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(1, zoom + delta), 4);
    setZoom(newZoom);
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
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [zoom, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoom > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, zoom]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChangeRoom = () => {
    navigate(`/ticketing/RoomSelection?catCodes=${catCode}&hideFloor=true${bookingId ? `&bookingId=${bookingId}` : ''}`);
  };

  const getSeatColor = (status: 'booked' | 'AVAILABLE' | 'fixed') => {
    switch (status) {
      case 'booked':
        return SEAT_COLORS.BOOKED;
      case 'AVAILABLE':
        return SEAT_COLORS.AVAILABLE;
      case 'fixed':
        return SEAT_COLORS.FIXED;
      default:
        return SEAT_COLORS.AVAILABLE;
    }
  };

  if (!DesksData?.rooms?.length || !mapFile || !navMapFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-white transition-opacity duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex-1 flex flex-col gap-2">
        {/* Header */}
        <div className="flex justify-between items-start pt-3 px-2">
          <div className="flex flex-col gap-1">
            <Text className="font-bold text-gray-600" style={{ fontSize: '12px' }}>
              {t(DesksData.rooms[0].roomName)}
            </Text>
          </div>
          {(bookingId && bookingId !== '' && (!configSeatchange || (configSeatchange === 'SAME_CATEGORY'))) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangeRoom}
              className="flex flex-col items-center gap-0.5 h-auto py-1 px-2"
            >
              <img src={switchIcon} alt="Switch" style={{ width: '16px', height: '16px' }} />
              <Text style={{ fontSize: '8px' }}>{t('seatSelection.changeRoom')}</Text>
            </Button>
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
            className="relative"
            style={{
              width: `${containerDimensions.width}px`,
              height: `${containerDimensions.height}px`,
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <img
              ref={imageRef}
              src={mapFile}
              alt="Seat Map"
              className="w-full h-full absolute"
              onLoadStart={() => setImageLoading(true)}
              onLoad={() => setTimeout(() => setImageLoading(false), 200)}
              style={{ objectFit: 'contain' }}
            />
            <SeatBox
              seats={DesksData.rawData}
              room={DesksData.rooms[0]}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              containerWidth={containerDimensions.width}
              containerHeight={containerDimensions.height}
            />
          </div>
        </div>

        {/* Legend and Navigation Map */}
        <div className="flex items-center justify-between px-5 pb-10">
          <div className="flex flex-col gap-0.5">
            <Indicator label={t('seatSelection.available')} color={getSeatColor('AVAILABLE')} />
            <Indicator label={t('seatSelection.inUse')} color={getSeatColor('booked')} />
            <Indicator label={t('seatSelection.fixed')} color={getSeatColor('fixed')} />
          </div>
          <Image
            src={navMapFile}
            alt="Navigation Map"
            className="max-w-[40%] h-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionScreen;
