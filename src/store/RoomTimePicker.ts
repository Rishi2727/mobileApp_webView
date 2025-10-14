import { create } from 'zustand';
import { getCategoryWiseDesks, getRoomWiseDesks } from './api';
import type { CategoryWiseAvailabilityRoom, RoomWiseDesk } from './api/ResponseModels';
import moment from 'moment-timezone';
import type { RoomWiseDesksPayload } from './api/RequestModels';
import isEqual from 'lodash/isEqual';

let refreshTimer: ReturnType<typeof setInterval> | null = null;
const intervalMs = 1800; // Refresh interval in milliseconds 


type roomFeatures = {
  scheduleSpecific: boolean;
  dayWiseBooking: boolean;
  timePicker: boolean;
  futureBooking: boolean;
  multiUserBooking: boolean;
  roomWiseBooking: boolean;
  maxDaysAvailable: number;
}

type reqPayload = {
  roomCodes: string[];
  catCode: string;
  dateTimeStart?: string;
  dateTimeEnd?: string;
  date?: string;
};

export type roomChart = {
  timeStart: moment.Moment;
  timeEnd: moment.Moment;
  status: 'Available' | 'Reserve' | 'Closed';
  roomCode: string;
  roomName: string;
}

type chartData = {
  headers: string[];
  data: {
    [timeTitle: string]: {
      rooms: roomChart[];
    };
  };
}

type displayData = {
  mode: 'CHART' | 'STRICT';
  catFeature: roomFeatures;
  chart?: chartData;
  rawData: RoomWiseDesk[];
  rooms?: CategoryWiseAvailabilityRoom[];
}

type RoomTimePickerStore = {
  init: (payload: reqPayload) => void;
  stopAndClear: () => void;

  DesksData: displayData | null;
  DesksDataChoice: reqPayload;

  fetchDesksData: (payload?: reqPayload) => Promise<void>;
};

export const useRoomTimePicker = create<RoomTimePickerStore>((set, get) => ({

  DesksData: null,
  DesksDataChoice: { roomCodes: [], catCode: '' },
  setCategoriesWiseDesksChoice: (DesksDataChoice: reqPayload) => { set({ DesksDataChoice }); },
  fetchDesksData: async (payload?: reqPayload) => {

    payload = payload || get().DesksDataChoice;
    const resCat = await getCategoryWiseDesks(payload?.catCode, { includeAvailability: false, date: payload?.date });
    if (!resCat?.success || !resCat.data) { set({ DesksData: null }); return; }

    let filteredRooms = resCat.data.filter(room => payload.roomCodes.includes(String(room.roomCode)));
    filteredRooms = filteredRooms.map(room => {
      return {
        ...room,
        // roomCloseTime: room.roomCloseTime === '00:00:00' || room.roomCloseTime === '23:59:00' ? '23:59:59' : room.roomCloseTime.substring(0, 6) + '59', // Ensure the time is in HH:mm:ss format
        roomCloseTime: room.roomCloseTime === '00:00:00' ? '24:00:00' : room.roomCloseTime,
      }
    });

    if (filteredRooms.length === 0) { set({ DesksData: null }); return; }

    const firstRoom = filteredRooms[0];

    const catFeatures: roomFeatures = {
      scheduleSpecific: firstRoom.scheduleSpecific,
      dayWiseBooking: firstRoom.featureDayWiseBooking,
      timePicker: firstRoom.featureTimePicker,
      futureBooking: firstRoom.featureFutureBooking,
      multiUserBooking: firstRoom.featureMultiUserBooking,
      roomWiseBooking: firstRoom.roomWiseBooking,
      maxDaysAvailable: Math.max(...filteredRooms.map(room => room.futureDaysAvailable || 0)),
    }



    const mode = catFeatures?.roomWiseBooking ? 'CHART' : 'STRICT';
    const days = catFeatures?.dayWiseBooking ? catFeatures.maxDaysAvailable : (catFeatures?.roomWiseBooking) ? 1 : undefined;
    const dateTimeStart = !catFeatures?.roomWiseBooking && catFeatures?.timePicker && payload?.dateTimeStart ? payload?.dateTimeStart : undefined;
    const dateTimeEnd = !catFeatures?.roomWiseBooking && catFeatures?.timePicker && payload?.dateTimeEnd ? payload?.dateTimeEnd : undefined;
    const date = catFeatures?.roomWiseBooking && !catFeatures?.dayWiseBooking && payload?.date ? payload?.date : undefined;

    const reqData: RoomWiseDesksPayload = {
      roomCode: filteredRooms.map(room => room.roomCode),
      mode: mode,
      ...(days && { days: days }),
      ...(dateTimeStart && { dateStart: dateTimeStart }),
      ...(dateTimeEnd && { dateEnd: dateTimeEnd }),
      ...(date && { date: date }),
    }

    const res = await getRoomWiseDesks(reqData);
    if (!res || !res?.success || !res.data) { set({ DesksData: null }); return; }

    let newData: displayData = {
      mode: mode,
      catFeature: catFeatures,
      rooms: filteredRooms,
      rawData: res.data,
    }
    if (mode === 'CHART' || catFeatures.roomWiseBooking) {

      let minTime = moment.min(...filteredRooms.map(room => moment(room.roomOpenTime, 'HH:mm:ss')));
      let maxTime = moment.max(...filteredRooms.map(room => moment(room.roomCloseTime, 'HH:mm:ss')));
      maxTime = maxTime.isBefore(minTime) ? maxTime.clone().add(1, 'day') : maxTime; // Ensure maxTime is after minTime
      const maxTimeString = maxTime.format('HH:mm:ss') === '00:00:00' ? '24:00:00' : maxTime.format('HH:mm:ss'); // Handle 00:00:00 case



      let minDate = moment.min(...res.data.map(room => moment(room.date)));
      let maxDate = moment.max(...res.data.map(room => moment(room.date)));

      let minDateTime = moment(`${minDate.format('YYYY-MM-DD')} ${minTime.format('HH:mm:ss')}`);
      let maxDateTime = moment(`${maxDate.format('YYYY-MM-DD')} ${maxTimeString}`);
      minDateTime = minDateTime.isAfter(moment()) ? minDateTime : moment().get('minute') >= 30 ? moment().startOf('hour').add(1, 'hour') : moment().startOf('hour').add(30, 'minutes');

      let intervals: moment.Moment[] = [];
      if (catFeatures.dayWiseBooking) {
        const current = minDateTime.clone().startOf('day');
        //FixMe: may be have to use isSameOrBefore
        while (current.isBefore(maxDateTime)) {
          intervals.push(current.clone());
          current.add(1, 'day');
        }
      } else {
        const current = minDateTime.clone();
        while (current.isBefore(maxDateTime)) {
          intervals.push(current.clone());
          current.add(30, 'minutes');
        }
      }

      let chart: chartData = {
        headers: filteredRooms.map(room => room.roomName),
        data: {

        },
      }

      intervals.forEach((time) => {
        // chart.data[time.format((catFeatures.dayWiseBooking ? 'MMM[,] DD' : 'LT'))] = {
        chart.data[time.format((catFeatures.dayWiseBooking ? 'YYYY-MM-DD 00:00:00' : 'HH:mm:ss'))] = {
          rooms: filteredRooms.map(room => {
            const todayData = (res?.data?.find(item => item.roomCode === room.roomCode && item.date === time.format('YYYY-MM-DD')));
            const receivedChart = (todayData?.deskBookingChart || '').split('|').filter(item => item.trim() !== '');

            const todayRoomOpen = moment(room.date + " " + room.roomOpenTime, 'YYYY-MM-DD HH:mm:ss');
            const todayRoomClose = moment(room.date + " " + room.roomCloseTime, 'YYYY-MM-DD HH:mm:ss');
            const frameMin = catFeatures.dayWiseBooking ? todayRoomOpen : time.clone();
            const frameMax = catFeatures.dayWiseBooking ? todayRoomClose : time.clone().add(30, 'minutes');

            const isThisTimeFrameReserved = receivedChart.some((item) => {
              const bookingStart = moment(item.split(',')[0]);
              const bookingEnd = moment(item.split(',')[1]);
              return (
                (frameMin.isBetween(bookingStart, bookingEnd) || frameMax.isBetween(bookingStart, bookingEnd)) ||
                (bookingStart.isBetween(frameMin, frameMax) || bookingEnd.isBetween(frameMin, frameMax)) ||
                (bookingStart.isSame(frameMin) || bookingEnd.isSame(frameMax))
              )
            });

            const isFutureDateAvailableForDayWiseBooking = !catFeatures.dayWiseBooking || moment(time, 'YYYY-MM-DD').diff(moment(), 'day') + 1 < room.futureDaysAvailable;

            const isRoomOpened = room.isTodayOperation && frameMin.isSameOrAfter(todayRoomOpen) && frameMax.isSameOrBefore(todayRoomClose);
            const isBooked = todayData?.isDeskBooked || false;
            const isAvailable = !isBooked && isRoomOpened && !isThisTimeFrameReserved;

            return {
              timeStart: frameMin,
              timeEnd: frameMax,
              status: !isFutureDateAvailableForDayWiseBooking ? 'Closed' : !isRoomOpened ? 'Closed' : isAvailable ? 'Available' : 'Reserve',
              roomCode: String(room.roomCode),
              roomName: room.roomName,
            };
          }),
        };
      });

      newData.chart = chart;
    } else {
      newData.rawData = res.data.map((item) => {
        item.isDeskFixed = filteredRooms.filter(room => room.roomCode === item.roomCode)[0]?.roomFixedSeatsNumbers?.split(',').includes(String(item.deskNo)) || false;
        return item;
      });
    }

    if (!isEqual(payload, get().DesksDataChoice)) { return; } // Avoid unnecessary updates

    if (!isEqual(get().DesksData, newData)) { // Check if the data is actually different
      set({ DesksData: newData });
    }

  },



  init: (payload) => {
    if (refreshTimer) return; // already started
    let choice = get().DesksDataChoice;
    set({ DesksDataChoice: payload });
    let choiceAfter = get().DesksDataChoice;
    if (!isEqual(choice, choiceAfter)) { set({ DesksData: null }); }
    if (payload.roomCodes.length > 0 && payload.catCode.trim() !== '') { get().fetchDesksData(); }
    refreshTimer = setInterval(() => {
      if (payload.roomCodes.length > 0 && payload.catCode.trim() !== '') { get().fetchDesksData(); }
    }, intervalMs);
  },

  stopAndClear: () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  },

}));