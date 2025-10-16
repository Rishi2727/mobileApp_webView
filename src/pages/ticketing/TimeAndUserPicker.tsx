import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import moment from "moment-timezone";
import { useNavigate, useSearchParams } from "react-router";
import { useRoomTimePicker } from "@/store/RoomTimePicker";
import { useLanguage } from "@/contexts/useLanguage";
import { useBookingsStore } from "@/store/BookingsStore";
import type { CategoryWiseAvailabilityRoom, MyBookingModel, UserDemography } from "@/store/api/ResponseModels";
import { useAuthStore } from "@/store/AuthStore";
import { useModelStore } from "@/store/ModelStore";
import Text from "@/components/ui/custom/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StudentField = {
  userId: string;
  studentName: string;
};

type slotsType = {
  slot: string;
  isDisabled: boolean;
};

const TimeAndUserPicker = () => {
  const { t } = useLanguage();
  const [totalFields, setTotalFields] = useState(50);
  const [students, setStudents] = useState<StudentField[]>(() => 
    Array(50).fill(null).map(() => ({ userId: "", studentName: "" }))
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [usersDemography, setUsersDemography] = useState<{ [key: string]: UserDemography | null }>({});
  const { createBooking, getUserDemography } = useBookingsStore();
  const { getMyProfile, myProfile } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const roomCode = searchParams.get('roomCode');
  const catCode = searchParams.get('catCode');
  const title = searchParams.get('title');
  const selectedRoomCode = searchParams.get('selectedRoomCode');
  const selectedDate = searchParams.get('selectedDate');
  const slotStartTime = searchParams.get('slotStartTime');
  const timeSlot = searchParams.get('timeSlot');
  
  const [roomCodes, setRoomCodes] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const { init, stopAndClear, DesksData } = useRoomTimePicker();
  const [roomData, setRoomData] = useState<CategoryWiseAvailabilityRoom | null>(null);
  const [generalError, setGeneralError] = useState<string>("");
  const [doingBooking, setDoingBooking] = useState<boolean>(false);
  const [masterSlots, setMasterSlots] = useState<slotsType[]>([]);
  const { newAlert } = useModelStore();

  // Parse params
  useEffect(() => {
    const rooms = roomCode ? roomCode.split(",") : [];
    setRoomCodes(rooms);
  }, [roomCode]);

  // Init data
  useEffect(() => {
    if (!catCode || roomCodes.length === 0) return;
    getMyProfile();
    init({ roomCodes, catCode, date: selectedDate ?? undefined });
    return () => stopAndClear();
  }, [init, catCode, roomCodes, selectedDate, stopAndClear, getMyProfile]);

  // Set room data and slots
  useEffect(() => {
    if (!DesksData?.rooms?.length || !selectedRoomCode) return;
    
    const room = DesksData.rooms.find(r => String(r.roomCode) === selectedRoomCode);
    if (!room) return;
    setRoomData(room);
    if (totalFields !== (room.roomMaxUsers || 0)) setTotalFields(room.roomMaxUsers || 0);

    if (!slotStartTime || !timeSlot) return;

    const roomSlotData = DesksData.chart?.data[timeSlot]?.rooms.find(r => r.roomCode === selectedRoomCode);
    const isSlotAvailable = roomSlotData?.status === 'Available';
    const isSlotExpired = (isSlotAvailable && room.featureDayWiseBooking === false) 
      ? roomSlotData.timeStart.clone().add(10, 'minutes').isBefore(moment()) 
      : false;

    if (!isSlotAvailable || isSlotExpired) {
      if (doingBooking) return;
      newAlert({
        message: t('timeAndUserPicker.selectAnotherTimeSlot'),
        icon: 'error',
        buttons: [{ 
          title: t('common.ok'), 
          onClickLoading: true, 
          color: 'primary', 
          action: async () => { 
            navigate(-1); 
            return true; 
          }, 
          closeOnSuccess: true 
        }]
      });
      return;
    }

    const maxTime = room.roomMaxUsetime || 0;
    const PossibleSlots: slotsType[] = [];
    const slotsList = Object.keys(DesksData.chart?.data || {});
    let foundCurrentSlot = false;
    
    if (slotsList.length === 0) return;
    
    slotsList.every(slot => {
      const currentSlotData = DesksData.chart?.data[slot]?.rooms.find(r => r.roomCode === selectedRoomCode);
      if (!currentSlotData) return false;
      if (slot === timeSlot) { foundCurrentSlot = true; }
      if (!foundCurrentSlot) return true;

      if (!DesksData.catFeature.dayWiseBooking && currentSlotData.timeEnd.diff(roomSlotData.timeStart, 'minutes') > maxTime) return false;
      if (DesksData.catFeature.dayWiseBooking && PossibleSlots.length >= room.roomMaxUsetime) return false;

      if (currentSlotData.status !== 'Available' && foundCurrentSlot) { 
        PossibleSlots.push({slot: slot, isDisabled: true});
      } else {
        PossibleSlots.push({slot: slot, isDisabled: false});
      }
      return true;
    });
    setMasterSlots(PossibleSlots);
  }, [DesksData, newAlert, selectedRoomCode, timeSlot, slotStartTime, navigate, totalFields, doingBooking, t]);

  // Set myProfile as first student
  useEffect(() => {
    if (myProfile) {
      setStudents(prev =>
        prev.map((student, index) => ({
          ...student,
          userId: index === 0 ? myProfile.userSchoolNo || '' : student.userId,
          studentName: index === 0 ? myProfile.userName || '' : student.studentName,
        }))
      );
      setUsersDemography(prev => ({
        ...prev,
        [myProfile.userSchoolNo || '']: {
          userId: myProfile.userId || '',
          userName: myProfile.userName || '',
          userDeptCode: myProfile.userDeptCode || '',
          userDeptName: myProfile.userDeptName || '',
          userPosCode: myProfile.userPosCode || '',
          userPosName: myProfile.userPosName || '',
          userStatusCode: myProfile.userStatusCode || '',
          userStatusName: myProfile.userStatusName || '',
        },
      }));
    }
  }, [myProfile]);

  // Debounced API call for user demography
  const debouncedGetUserDemography = useCallback((userId: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      const userIdExists = Object.keys(usersDemography).includes(userId);
      if (userIdExists || userId.trim() === '') return;
      
      getUserDemography(userId).then(apiData => {
        if (apiData === null) return;
        setUsersDemography(prev => ({ ...prev, [userId]: apiData.data ?? null }));
      });
    }, 500);
  }, [usersDemography, getUserDemography]);

  // Check for duplicate user IDs
  const getDuplicateUserIds = useCallback(() => {
    const userIds = students
      .map(s => s.userId.trim().toLowerCase())
      .filter(id => id !== '');
    
    const duplicates = userIds.filter((id, index) => 
      userIds.indexOf(id) !== index
    );
    
    return [...new Set(duplicates)];
  }, [students]);

  // Check if a specific user ID is duplicate
  const isUserIdDuplicate = useCallback((userId: string, currentIndex: number) => {
    if (!userId.trim()) return false;
    
    return students.some((student, index) => 
      index !== currentIndex && 
      student.userId.trim().toLowerCase() === userId.trim().toLowerCase()
    );
  }, [students]);

  // Optimized input change handler
  const handleInputChange = useCallback((index: number, field: "userId" | "studentName", value: string) => {
    setGeneralError("");
    
    setStudents(prev => prev.map((student, i) => {
      if (i === index) {
        if (field === "userId") {
          return { ...student, userId: value, studentName: '' };
        }
        return { ...student, [field]: value };
      }
      return student;
    }));

    if (field === "userId") {
      debouncedGetUserDemography(value);
    }
  }, [debouncedGetUserDemography]);

  // Memoized validation
  const validateFields = useCallback(() => {
    let hasError = '';
    
    const duplicateIds = getDuplicateUserIds();
    if (duplicateIds.length > 0) {
      hasError = t('timeAndUserPicker.duplicateUserIds') || 'Duplicate user IDs are not allowed';
      newAlert({ 
        message: hasError, 
        icon: 'error',
        buttons: [{ title: t('common.ok'), action: () => { }, color: 'primary' }] 
      });
      return false;
    }
    
    const users = students.filter(student => {
      student.userId = student.userId.trim();
      student.studentName = student.studentName.trim();
      if (student.userId === '' || student.studentName === '') return false;
      const demography = usersDemography[student.userId];
      if (!demography) return false;
      if (demography.userName?.toLowerCase().trim() !== student.studentName?.toLowerCase().trim()) return false;
      
      if (
        (roomData?.roomDepartmentState === 'SELECTED_BLOCKED' && roomData.roomDepartmentMapped?.split(',').includes(demography.userDeptCode || '')) ||
        (roomData?.roomDepartmentState === 'SELECTED_ALLOWED' && !roomData.roomDepartmentMapped?.split(',').includes(demography.userDeptCode || ''))
      ) {
        hasError = t('timeAndUserPicker.departmentNotAllowed')
          .replace('{{userName}}', demography.userName)
          .replace('{{departmentName}}', demography.userDeptName);
        return false;
      }
      if (
        (roomData?.roomPositionState === 'SELECTED_BLOCKED' && roomData.roomPositionMapped?.split(',').includes(demography.userPosCode || '')) ||
        (roomData?.roomPositionState === 'SELECTED_ALLOWED' && !roomData.roomPositionMapped?.split(',').includes(demography.userPosCode || ''))
      ) {
        hasError = t('timeAndUserPicker.positionNotAllowed')
          .replace('{{userName}}', demography.userName)
          .replace('{{positionName}}', demography.userPosName);
        return false;
      }
      if (
        (roomData?.roomStatusState === 'SELECTED_BLOCKED' && roomData.roomStatusMapped?.split(',').includes(demography.userStatusCode || '')) ||
        (roomData?.roomStatusState === 'SELECTED_ALLOWED' && !roomData.roomStatusMapped?.split(',').includes(demography.userStatusCode || ''))
      ) {
        hasError = t('timeAndUserPicker.statusNotAllowed')
          .replace('{{userName}}', demography.userName)
          .replace('{{statusName}}', demography.userStatusName);
        return false;
      }
      return !hasError;
    });

    const isValid = (DesksData?.catFeature.multiUserBooking && users.length >= (roomData?.roomMinUsers || 1)) || !DesksData?.catFeature.multiUserBooking;
    if (!isValid && hasError === '') hasError = t('timeAndUserPicker.minimumStudentsValidation').replace('{{count}}', String(roomData?.roomMinUsers || 1));
    
    if (hasError) {
      newAlert({ 
        message: hasError, 
        icon: 'error', 
        buttons: [{ title: t('common.ok'), action: () => { }, color: 'primary' }] 
      });
    }
    return hasError === '';
  }, [students, usersDemography, roomData, DesksData?.catFeature, t, newAlert, getDuplicateUserIds]);

  // Memoized submit handler
  const handleSubmit = useCallback(() => {
    if (!DesksData?.rooms?.length || !selectedRoomCode || !slotStartTime) return;
    
    const room = DesksData.rooms.find(r => String(r.roomCode) === selectedRoomCode);
    if (!room) return;
    
    if (validateFields()) {
      newAlert({
        disableOnClick: true,
        message: t('timeAndUserPicker.areYouSureBookPrefix') + ' ' + t(String(title)) + t('timeAndUserPicker.areYouSureBookSuffix'),
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
                    action: () => { navigate(-1); },
                    closeOnSuccess: true,
                    color: 'primary',
                  }
                ]
              });
            },
            onSuccess: (raw) => {
              const result = raw?.data as MyBookingModel;
              newAlert({
                message: raw.msg || t('timeAndUserPicker.bookingSuccessMessage'),
                icon: 'success',
                buttons: [
                  {
                    title: t('common.ok'),
                    action: () => { navigate(`/bookings?bookingId=${result.bookingId}&catCode=${catCode}`); },
                    closeOnSuccess: true,
                    color: 'primary',
                  }
                ],
              });
            },
            action: async () => {
              const members: { [key: string]: string; } = {};
              students.forEach(student => {
                if (student.userId && student.studentName && myProfile?.userId?.toLowerCase().trim() !== student.userId?.toLowerCase().trim()) {
                  members[student.userId] = student.studentName;
                }
              });
              const selectSlotActual = (selectedSlot >= masterSlots.length) ? masterSlots.length - 1 : selectedSlot;

              setDoingBooking(true);

              const bk = await createBooking({
                reserveDeskCode: Number(selectedRoomCode),
                type: 'ROOM',
                members: DesksData?.catFeature.multiUserBooking ? members : undefined,
                timeMinutesOrDays: DesksData.catFeature.timePicker ? (DesksData.catFeature.dayWiseBooking ? selectSlotActual + 1 : (selectSlotActual + 1) * 30) : undefined,
                bookingStartFrom: moment(slotStartTime).format("YYYY-MM-DD HH:mm:ss"),
                bookingStartFromNow: false,
              });
              if (bk?.success) return Promise.resolve(bk);
              return Promise.reject(bk?.msg);
            },
            closeOnSuccess: true,
          },
          { title: t('common.no'), action: () => { }, color: 'secondary' }
        ],
      });
    }
  }, [DesksData, selectedRoomCode, slotStartTime, validateFields, newAlert, t, title, students, myProfile, selectedSlot, masterSlots, createBooking, navigate, catCode]);

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto pb-12">
      <div className="flex-1 p-2">
        <div className="w-full max-w-[328px] px-2 py-2 bg-white rounded mb-2">
          <Text className="font-bold text-blue-900" style={{ fontSize: '14px' }}>
            {title ? t(title) : ''}
          </Text>
          <Text className="text-gray-500 mb-1" style={{ fontSize: '11px' }}>
            {slotStartTime ? moment(slotStartTime).format('LLL') : ''}
          </Text>
        </div>
        
        <div 
          className="w-full max-w-[328px] px-2 py-2 bg-white rounded mb-2"
          style={{ display: (DesksData?.catFeature.multiUserBooking ? 'block' : 'none') }}
        >
          <div className="h-px bg-gray-400 my-1"></div>
          <Text className="font-bold text-blue-700 mb-0.5" style={{ fontSize: '12px' }}>
            {t('timeAndUserPicker.enterStudentDetails')}
          </Text>
          <Text className="mb-1" style={{ fontSize: '11px' }}>
            {t('timeAndUserPicker.minimumStudentsRequired').replace('{{count}}', String(roomData?.roomMinUsers || 1))}
          </Text>
          
          {generalError && (
            <div className="bg-red-500 p-1.5 rounded mb-1">
              <Text className="text-white" style={{ fontSize: '11px' }}>{generalError}</Text>
            </div>
          )}
          
          {useMemo(() => [...Array(totalFields)].map((_, index) => {
            const student = students[index];
            const isDuplicate = isUserIdDuplicate(student.userId, index);
            const hasInvalidDemography = (student.userId in usersDemography === true && usersDemography[student.userId] === null);
            const hasNameMismatch = (student.userId in usersDemography === true && usersDemography[student.userId] !== null && usersDemography[student.userId]?.userName?.toLowerCase().trim() !== student.studentName?.toLowerCase().trim());
            
            return (
              <div key={index} className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Input
                    placeholder={t('timeAndUserPicker.userIdPlaceholder')}
                    value={student.userId}
                    onChange={(e) => handleInputChange(index, "userId", e.target.value)}
                    disabled={index === 0}
                    onFocus={() => {
                      if (index !== 0) {
                        setStudents(prev =>
                          prev.map((s, i) => ({
                            ...s,
                            studentName: i === index ? '' : s.studentName,
                          }))
                        );
                      }
                    }}
                    className={`${(isDuplicate || hasInvalidDemography) ? 'border-red-500' : ''}`}
                  />
                  {(isDuplicate || hasInvalidDemography) && (
                    <Text className="text-red-500 text-xs mt-0.5">
                      {isDuplicate 
                        ? (t('timeAndUserPicker.duplicateUserId') || 'This user ID is already used')
                        : t('timeAndUserPicker.userIdNotFound')
                      }
                    </Text>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={t('timeAndUserPicker.studentNamePlaceholder')}
                    value={student.studentName}
                    onChange={(e) => handleInputChange(index, "studentName", e.target.value)}
                    disabled={index === 0 || !student.userId || !usersDemography[student.userId] || usersDemography[student.userId]?.userName?.toLowerCase().trim() === student.studentName?.toLowerCase().trim()}
                    className={`${hasNameMismatch ? 'border-red-500' : ''}`}
                  />
                  {hasNameMismatch && (
                    <Text className="text-red-500 text-xs mt-0.5">
                      {student.studentName === '' ? t('timeAndUserPicker.studentNameRequired') : t('timeAndUserPicker.studentNameNotMatch')}
                    </Text>
                  )}
                </div>
              </div>
            );
          }), [totalFields, students, usersDemography, handleInputChange, t, isUserIdDuplicate])}
        </div>
        
        <div 
          className="w-full max-w-[328px] px-2 py-2 bg-white rounded mb-2"
          style={{ display: (DesksData?.catFeature.timePicker ? 'block' : 'none') }}
        >
          <div className="h-px bg-gray-400 my-1"></div>
          <Text className="font-bold text-blue-700 mb-0.5" style={{ fontSize: '12px' }}>
            {t('timeAndUserPicker.chooseUsageTime')}
          </Text>
          <Text className="mb-1" style={{ fontSize: '11px' }}>
            {t('timeAndUserPicker.usageTimeDescription')}
          </Text>
          
          <div>
            {useMemo(() => Array.from({ length: Math.ceil(masterSlots.length / 2) }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex gap-2 mb-2">
                {[0, 1].map((colIdx) => {
                  const index = rowIdx * 2 + colIdx;
                  if (index >= masterSlots.length) return null;
                  const slot = masterSlots[index];
                  const isSelected = selectedSlot >= index;
                  return (
                    <Button
                      key={index}
                      onClick={() => setSelectedSlot(index)}
                      disabled={slot.isDisabled}
                      className="flex-1"
                      variant={isSelected ? 'default' : 'outline'}
                    >
                      <Text className={isSelected ? 'text-white' : 'text-gray-900'}>
                        {DesksData?.catFeature.dayWiseBooking 
                          ? moment(slot.slot).format('ll').split(',')[0].split('년 ')?.[1] || moment(slot.slot).format('ll').split(',')[0].split('년 ')?.[0]
                          : index * 30 + 30 + ' ' + t('timeAndUserPicker.minutes')
                        }
                      </Text>
                    </Button>
                  );
                })}
              </div>
            )), [masterSlots, selectedSlot, DesksData?.catFeature, t])}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-2">
        <div className="w-full max-w-[328px] p-2 bg-white rounded mt-5">
          <div className="flex">
            <Button onClick={handleSubmit} className="flex-1 bg-blue-700">
              <Text className="text-white">{t('timeAndUserPicker.submit')}</Text>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeAndUserPicker;
