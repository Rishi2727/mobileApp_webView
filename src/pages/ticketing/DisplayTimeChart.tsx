import { useState, useEffect, useMemo, useCallback } from "react";
import { useRoomTimePicker } from "@/store/RoomTimePicker";
import type { roomChart } from "@/store/RoomTimePicker";
import { useSearchParams, useNavigate } from "react-router";
import moment from "moment-timezone";
import type { Moment } from "moment-timezone";
import { useLanguage } from "@/contexts/useLanguage";
import { useModelStore } from "@/store/ModelStore";
import { useBookingsStore } from "@/store/BookingsStore";
import type { MyBookingModel } from "@/store/api/ResponseModels";
import Text from "@/components/ui/custom/text";
import { ScrollArea } from "@/components/ui/scroll-area";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";

const SLOT_STATES = [
  { state: 'Available', color: '#E0F2FE', fontColor: '#0F172A' },
  { state: 'Reserve', color: '#D1D5DB', fontColor: '#F9FAFB' },
  { state: 'Closed', color: '#D1D5DB', fontColor: '#F9FAFB' },
];

const getSlotState = (state: string) =>
  SLOT_STATES.find((slot) => slot.state === state) || { color: '#FFFFFF', fontColor: '#0F172A' };

const ITEMS_PER_PAGE = 3;

const DisplayTimeChart = () => {
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Moment | null>(moment());
  const [availableDays, setAvailableDays] = useState<Moment[]>([]);
  const [roomCodes, setRoomCodes] = useState<string[]>([]);
  const [currentDisplayFrom, setCurrentDisplayFrom] = useState<number>(0);
  
  // Animation states
  const [isSliding, setIsSliding] = useState(false);
  const [showTableLoading, setShowTableLoading] = useState(false);
  const [pageLength, setPageLength] = useState<number>(0);
  const [buttonTransform, setButtonTransform] = useState<number>(0);
  const [tableOpacity, setTableOpacity] = useState<number>(1);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const catCode = searchParams.get('catCode');
  const roomCode = searchParams.get('roomCode');
  const title = searchParams.get('title');
  
  const { init, stopAndClear, DesksData } = useRoomTimePicker();
  const { newAlert } = useModelStore();
  const { createBooking } = useBookingsStore();

  // Parse params
  useEffect(() => {
    const rooms = roomCode ? String(roomCode).split(",") : [];
    setRoomCodes(rooms);
  }, [catCode, roomCode]);

  // Init data (useFocusEffect equivalent)
  useEffect(() => {
    if (!catCode || roomCodes.length === 0) return;
    init({ roomCodes, catCode: String(catCode), date: selectedDate?.format("YYYY-MM-DD") });
    return () => stopAndClear();
  }, [init, catCode, roomCodes, selectedDate, stopAndClear]);

  // Set available days
  useEffect(() => {
    if (
      DesksData?.catFeature?.maxDaysAvailable !== undefined &&
      DesksData.catFeature.maxDaysAvailable > 0 &&
      !DesksData.catFeature.dayWiseBooking
    ) {
      const today = moment().startOf('day');
      const days = Array.from({ length: DesksData.catFeature.maxDaysAvailable }, (_, i) => today.clone().add(i, 'days'));
      setAvailableDays(days);
      if (!selectedDate || !days.some(day => day.isSame(selectedDate, 'day'))) setSelectedDate(days[0]);
    }
    if (DesksData?.chart?.headers?.length) {
      setPageLength(Math.ceil(DesksData.chart.headers.length / ITEMS_PER_PAGE));
    }
  }, [DesksData, selectedDate, language]);

  // Reset page on date change
  useEffect(() => {
    setCurrentDisplayFrom(0);
  }, [selectedDate]);

  // Navigation
  const canSlide = useCallback((dir: 'left' | 'right') => {
    const total = DesksData?.chart?.headers?.length || 0;
    if (dir === 'right') return currentDisplayFrom + ITEMS_PER_PAGE < total;
    return currentDisplayFrom > 0;
  }, [DesksData?.chart?.headers, currentDisplayFrom]);

  const slide = useCallback((dir: 'left' | 'right') => {
    if (!DesksData?.chart?.headers || isSliding) return;
    const total = DesksData.chart.headers.length;

    setIsSliding(true);
    setShowTableLoading(true);

    // Button slide feedback animation (matching Animated.sequence timing)
    setButtonTransform(dir === 'right' ? -5 : 5);
    setTimeout(() => {
      setButtonTransform(0);
    }, 100);

    // Table loading animation (matching Animated.timing timing)
    setTableOpacity(0.3);
    setOverlayOpacity(0.8);

    // Update data after loading animation starts (matching old timing)
    setTimeout(() => {
      if (dir === 'right' && canSlide('right')) {
        setCurrentDisplayFrom(prev => Math.min(prev + ITEMS_PER_PAGE, total - ITEMS_PER_PAGE));
      }
      if (dir === 'left' && canSlide('left')) {
        setCurrentDisplayFrom(prev => Math.max(prev - ITEMS_PER_PAGE, 0));
      }

      // Restore table opacity (matching Animated.timing duration: 200)
      setTimeout(() => {
        setTableOpacity(1);
        setOverlayOpacity(0);
        setIsSliding(false);
        setShowTableLoading(false);
      }, 200);
    }, 150);
  }, [DesksData?.chart?.headers, isSliding, canSlide]);

  // Memoized date formatting
  const formatTime = useCallback((timeSlot: string) => {
    return (timeSlot.length === 8) 
      ? moment(timeSlot, "HH:mm:ss").format("LT")
      : moment(timeSlot).format('ll').split(',')[0].split('년 ')?.[1] || moment(timeSlot).format('ll').split(',')[0].split('년 ')?.[0];
  }, []);

  // Memoized room size calculation
  const getSingleRoomSize = useCallback((lst: string[] | undefined) => {
    if (!lst) return 75;
    if (lst.length === 1) return 245;
    if (lst.length === 2) return 121;
    return 79;
  }, []);

  // Memoized visible headers and data
  const visibleHeaders = useMemo(() => {
    return DesksData?.chart?.headers?.slice(currentDisplayFrom, currentDisplayFrom + ITEMS_PER_PAGE) || [];
  }, [DesksData?.chart?.headers, currentDisplayFrom]);

  const visibleTimeSlots = useMemo(() => {
    if (!DesksData?.chart?.data) return {};
    const result: Record<string, { rooms: roomChart[] }> = {};
    Object.keys(DesksData.chart.data).forEach(timeSlot => {
      result[timeSlot] = {
        ...DesksData.chart!.data[timeSlot],
        rooms: DesksData.chart!.data[timeSlot]?.rooms?.slice(currentDisplayFrom, currentDisplayFrom + ITEMS_PER_PAGE) || []
      };
    });
    return result;
  }, [DesksData?.chart, currentDisplayFrom]);

  // Booking handler
  const handleSlotPress = useCallback((timeSlot: string, room: roomChart) => {
    if (!DesksData?.catFeature) return;
    if (!(DesksData.catFeature.multiUserBooking === false && DesksData.catFeature.timePicker === false)) {
      navigate(`/ticketing/TimeAndUserPicker?roomCode=${roomCodes.join(',')}&catCode=${catCode}&title=${room.roomName}&timeSlot=${timeSlot}&selectedRoomCode=${room.roomCode}&selectedDate=${selectedDate?.format("YYYY-MM-DD")}&slotStartTime=${room.timeStart.format("YYYY-MM-DD HH:mm:ss")}`);
      return;
    }
    newAlert({
      disableOnClick: true,
      message: t('displayTimeChart.areYouSureBookPrefix') + ' ' + t(room.roomName) + t('displayTimeChart.areYouSureBookSuffix'),
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
                  action: () => {},
                  closeOnSuccess: true,
                  color: 'primary',
                }
              ]
            });
          },
          onSuccess: (raw) => {
            const result = raw?.data as MyBookingModel;
            newAlert({
              message: raw.msg || t('displayTimeChart.bookingSuccessMessage'),
              icon: 'success',
              buttons: [
                {
                  title: t('common.ok'),
                  action: () => navigate(`/bookings?bookingId=${result.bookingId}&catCode=${catCode}`),
                  closeOnSuccess: true,
                  color: 'primary',
                }
              ],
            });
          },
          action: async () => {
            const bk = await createBooking({
              reserveDeskCode: Number(room.roomCode),
              type: 'ROOM',
              bookingStartFrom: (room.timeStart && room.timeStart.isAfter(moment())) ? room.timeStart.format("YYYY-MM-DD HH:mm:ss") : undefined,
              bookingStartFromNow: !room.timeStart || room.timeStart.isBefore(moment()),
            });
            if (bk?.success) return Promise.resolve(bk);
            return Promise.reject(bk?.msg);
          },
          closeOnSuccess: true,
        },
        { title: t('common.no'), action: () => { }, color: 'secondary' }
      ],
    });
  }, [DesksData?.catFeature, roomCodes, catCode, selectedDate, t, newAlert, navigate, createBooking]);

  if (!DesksData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const breadcrumbItems = metadata.ticketingDisplayTimeChart?.breadcrumbItems || [];

  return (
    <div className="min-h-[90vh] bg-primary-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title={title || "Time Chart"}
        showBackButton={true}
      />
      
      <div className="p-3 bg-gray-50 flex flex-col overflow-hidden">
        {/* Days Row */}
        <div 
          className="mb-2"
          style={{ display: (DesksData?.catFeature.dayWiseBooking) ? 'none' : 'block' }}
        >
        <div className="flex flex-col">
          <div className="flex justify-around mb-2.5">
            {availableDays.map((day, idx) => (
              <Text key={idx} className="flex-1 text-center text-sm">
                {day.format("ddd")[0]}
              </Text>
            ))}
          </div>
          <div className="flex justify-around mb-5">
            {availableDays.map((day) => (
              <div key={day.format("YYYY-MM-DD")}>
                <button
                  onClick={() => setSelectedDate(day)}
                  className={`p-2.5 mx-1 rounded-full border min-w-[30px] min-h-[30px] flex items-center justify-center transition-colors shadow-sm ${
                    selectedDate?.isSame(day, 'day')
                      ? 'bg-blue-900 border-blue-900'
                      : 'bg-transparent border-gray-300'
                  }`}
                >
                  <Text 
                    className={`text-sm text-center ${selectedDate?.isSame(day, 'day') ? 'text-white font-bold' : 'text-gray-900'}`}
                  >
                    {day.format("DD")}
                  </Text>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-px bg-gray-300 my-1.5"></div>
      
      {/* Navigation and Title */}
      <div className="flex justify-between w-full mb-3.5">
        <div>
          <button
            onClick={() => slide('left')}
            disabled={!canSlide('left') || isSliding}
            className={`h-10 w-10 rounded-lg shadow flex items-center justify-center transition-transform duration-100 ${
              canSlide('left') ? 'bg-blue-600' : 'bg-gray-400'
            }`}
            style={{ 
              padding: '10px',
              transform: `translateX(${buttonTransform}px)`,
              transition: 'transform 100ms'
            }}
          >
            <Text className="text-white text-lg">{'<'}</Text>
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Text className="font-bold text-center text-base mb-3.5">
            {title || ''}
          </Text>
        </div>
        <div>
          <button
            onClick={() => slide('right')}
            disabled={!canSlide('right') || isSliding}
            className={`h-10 w-10 rounded-lg shadow flex items-center justify-center transition-transform duration-100 ${
              canSlide('right') ? 'bg-blue-600' : 'bg-gray-400'
            }`}
            style={{ 
              padding: '10px',
              transform: `translateX(${buttonTransform}px)`,
              transition: 'transform 100ms'
            }}
          >
            <Text className="text-white text-lg">{'>'}</Text>
          </button>
        </div>
      </div>
      
      {/* Table */}
      {!(DesksData && DesksData.chart && DesksData?.chart?.headers && DesksData?.chart?.data) ? (
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: '200px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {pageLength > 2 && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(pageLength)].map((_, index) => {
                const isActive = index === Math.ceil(currentDisplayFrom / ITEMS_PER_PAGE);
                return (
                  <div
                    key={index}
                    className="h-1 flex-1 rounded-full"
                    style={{ backgroundColor: isActive ? '#93C5FD' : '#DBEAFE' }}
                  ></div>
                );
              })}
            </div>
          )}
          
          <div className="overflow-x-auto overflow-y-auto flex-1 relative">
            {/* Table loading overlay */}
            {showTableLoading && (
              <div 
                className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white z-50 rounded-lg"
                style={{ 
                  opacity: overlayOpacity,
                  transition: 'opacity 150ms'
                }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Table content with loading effect */}
            <div
              className="rounded-lg"
              style={{ 
                opacity: tableOpacity,
                transition: 'opacity 200ms'
              }}
            >
              <ScrollArea className="h-full">
                <div className="pb-80">
                  {/* Header */}
                  <div className="flex items-center mb-0.5 sticky top-0 bg-gray-50 z-10">
                    <div
                      className="flex-1 rounded border border-gray-300 bg-gray-100 flex items-center justify-center p-2 mr-1 ml-1 shadow-sm"
                      style={{ width: '65px', minHeight: '40px' }}
                    >
                      <Text className="text-center font-bold text-blue-700 text-[10px]">
                        {t('displayTimeChart.time')}
                      </Text>
                    </div>
                    <div className="flex-[3]">
                      <div className="flex">
                        {visibleHeaders.map((header) => (
                          <div
                            key={header}
                            className="rounded border border-gray-300 bg-gray-100 flex items-center justify-center p-2 mr-1 shadow-sm"
                            style={{
                              width: `${getSingleRoomSize(DesksData?.chart?.headers)}px`,
                              minHeight: '40px'
                            }}
                          >
                            <Text className="text-center font-bold text-blue-700 text-[10px]">
                              {t(header)}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {Object.keys(DesksData.chart.data).length === 0 && (
                    <div className="mt-5">
                      <div className="w-full h-[50px] flex flex-col items-center justify-center">
                        <Text className="font-semibold text-red-500 mb-2 text-base">
                          {t('displayTimeChart.roomsClosed')}
                        </Text>
                        <Text className="text-red-500 text-sm">
                          {t('displayTimeChart.noOperationalHours')}
                        </Text>
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(visibleTimeSlots).map((timeSlot) => (
                    <div key={timeSlot} className="flex items-center rounded bg-white mb-0.5">
                      <div
                        className="flex-1 flex items-center justify-center py-2 ml-1"
                        style={{ width: '65px' }}
                      >
                        <Text className="font-bold text-gray-900 text-[10px]">
                          {formatTime(timeSlot)}
                        </Text>
                      </div>

                      <div className="flex-1 flex">
                        {visibleTimeSlots[timeSlot]?.rooms?.map((room: roomChart, roomIndex: number) => {
                          const status = room.status;
                          const slotState = getSlotState(status);
                          const isAvailable = status === "Available";
                          return (
                            <div
                              className="flex-1 flex items-center justify-center rounded mr-1 my-0.5"
                              style={{ backgroundColor: slotState.color, minHeight: '30px' }}
                              key={`${room.roomCode}-${roomIndex}`}
                            >
                              <button
                                style={{
                                  width: `${getSingleRoomSize(DesksData?.chart?.headers)}px`,
                                }}
                                className="flex items-center justify-center px-2.5 py-1"
                                disabled={!isAvailable}
                                onClick={() => handleSlotPress(timeSlot, room)}
                              >
                                <Text
                                  className="font-semibold text-[10px]"
                                  style={{ color: slotState.fontColor }}
                                >
                                  {t(status)}
                                </Text>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default DisplayTimeChart;
