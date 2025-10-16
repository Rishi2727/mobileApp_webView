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
import { Button } from "@/components/ui/button";

const SLOT_STATES = [
  { state: 'Available', color: '#E0F2FE', fontColor: '#0F172A' },
  { state: 'Reserve', color: '#D1D5DB', fontColor: '#F9FAFB' },
  { state: 'Closed', color: '#D1D5DB', fontColor: '#F9FAFB' },
];

const getSlotState = (state: string) =>
  SLOT_STATES.find((slot) => slot.state === state) || { color: '#FFFFFF', fontColor: '#0F172A' };

const ITEMS_PER_PAGE = 3;

const DisplayTimeChart = () => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Moment | null>(moment());
  const [availableDays, setAvailableDays] = useState<Moment[]>([]);
  const [roomCodes, setRoomCodes] = useState<string[]>([]);
  const [currentDisplayFrom, setCurrentDisplayFrom] = useState<number>(0);
  const [isSliding, setIsSliding] = useState(false);
  const [pageLength, setPageLength] = useState<number>(0);

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

  // Init data
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
  }, [DesksData, selectedDate]);

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

    // Update data with slight delay for transition effect
    setTimeout(() => {
      if (dir === 'right' && canSlide('right')) {
        setCurrentDisplayFrom(prev => Math.min(prev + ITEMS_PER_PAGE, total - ITEMS_PER_PAGE));
      }
      if (dir === 'left' && canSlide('left')) {
        setCurrentDisplayFrom(prev => Math.max(prev - ITEMS_PER_PAGE, 0));
      }
      setTimeout(() => setIsSliding(false), 200);
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-50 flex flex-col h-full overflow-hidden">
      {/* Days Row */}
      <div 
        className="overflow-x-auto scrollbar-hide mb-2"
        style={{ display: (DesksData?.catFeature.dayWiseBooking) ? 'none' : 'block' }}
      >
        <div className="flex flex-col min-w-max">
          <div className="flex mb-2">
            {availableDays.map((day, idx) => (
              <Text key={idx} className="flex-1 text-center" style={{ fontSize: '14px' }}>
                {day.format("ddd")[0]}
              </Text>
            ))}
          </div>
          <div className="flex mb-4">
            {availableDays.map((day) => (
              <div key={day.format("YYYY-MM-DD")}>
                <button
                  onClick={() => setSelectedDate(day)}
                  className={`p-2 mx-1 rounded-full border min-w-[30px] min-h-[30px] flex items-center justify-center transition-colors ${
                    selectedDate?.isSame(day, 'day')
                      ? 'bg-blue-900 border-blue-900'
                      : 'bg-transparent border-gray-300'
                  }`}
                >
                  <Text 
                    className={selectedDate?.isSame(day, 'day') ? 'text-white font-bold' : 'text-gray-900'}
                    style={{ fontSize: '14px' }}
                  >
                    {day.format("DD")}
                  </Text>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-px bg-gray-300 my-1"></div>
      
      {/* Navigation and Title */}
      <div className="flex justify-between w-full mb-2">
        <div>
          <Button
            onClick={() => slide('left')}
            disabled={!canSlide('left') || isSliding}
            variant={canSlide('left') ? 'default' : 'outline'}
            size="icon"
            className={`h-10 w-10 rounded-lg shadow transition-transform ${
              isSliding ? 'scale-95' : ''
            }`}
          >
            <Text className="text-white text-lg">{'<'}</Text>
          </Button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Text className="font-bold text-center" style={{ fontSize: '16px' }}>
            {title || ''}
          </Text>
        </div>
        <div>
          <Button
            onClick={() => slide('right')}
            disabled={!canSlide('right') || isSliding}
            variant={canSlide('right') ? 'default' : 'outline'}
            size="icon"
            className={`h-10 w-10 rounded-lg shadow transition-transform ${
              isSliding ? 'scale-95' : ''
            }`}
          >
            <Text className="text-white text-lg">{'>'}</Text>
          </Button>
        </div>
      </div>
      
      {/* Table */}
      {!(DesksData && DesksData.chart && DesksData?.chart?.headers && DesksData?.chart?.data) ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
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
                    style={{ backgroundColor: isActive ? '#60A5FA' : '#DBEAFE' }}
                  ></div>
                );
              })}
            </div>
          )}
          
          <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-hide">
            <div className="relative">
              {/* Table content with loading effect */}
              <div
                className={`transition-opacity duration-200 rounded-lg ${
                  isSliding ? 'opacity-30' : 'opacity-100'
                }`}
              >
                <div className="pb-80">
                  {/* Header */}
                  <div className="flex items-center mb-0.5 sticky top-0 bg-gray-50 z-10">
                    <div
                      className="flex-1 rounded border border-gray-300 bg-gray-100 flex items-center justify-center p-2 mr-1 ml-1"
                      style={{ width: '65px', minHeight: '40px' }}
                    >
                      <Text className="text-center font-bold text-blue-700" style={{ fontSize: '10px' }}>
                        {t('displayTimeChart.time')}
                      </Text>
                    </div>
                    <div className="flex-[3]">
                      <div className="flex">
                        {visibleHeaders.map((header) => (
                          <div
                            key={header}
                            className="rounded border border-gray-300 bg-gray-100 flex items-center justify-center p-2 mr-1"
                            style={{
                              width: `${getSingleRoomSize(DesksData?.chart?.headers)}px`,
                              minHeight: '40px'
                            }}
                          >
                            <Text className="text-center font-bold text-blue-700" style={{ fontSize: '10px' }}>
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
                        <Text className="font-semibold text-red-500 mb-2" style={{ fontSize: '16px' }}>
                          {t('displayTimeChart.roomsClosed')}
                        </Text>
                        <Text className="text-red-500" style={{ fontSize: '14px' }}>
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
                        <Text className="font-bold text-gray-900" style={{ fontSize: '10px' }}>
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
                                className="flex items-center justify-center px-2 py-1"
                                disabled={!isAvailable}
                                onClick={() => handleSlotPress(timeSlot, room)}
                              >
                                <Text
                                  className="font-semibold"
                                  style={{ color: slotState.fontColor, fontSize: '10px' }}
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
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DisplayTimeChart;
