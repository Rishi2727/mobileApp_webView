import { commonIcons } from "@/assets";
import { Card, CardContent } from "@/components/ui/card";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { Trash2, Heart, Plus } from "lucide-react";
import { useCallback, useEffect } from "react";
import { ShowAlert } from "@/components/ui/custom/my-alert";
import Text from "@/components/ui/custom/text";
import { useFavouriteSeatStore, maxFavouriteSeatsLimit, type FavouriteSeat } from "@/store/FavouriteSeat";
import { useBookingsStore } from "@/store/BookingsStore";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/custom/icon";

export default function PreferredSeat() {
  const breadcrumbItems = metadata.PreferredSeatSetting.breadcrumbItems || [];
  const { t } = useTranslation();
  const {
    favouriteSeats,
    checkLimit,
    init,
    stopAndClear,
    removeFavouriteSeat,
    prependFavouriteSeat,
    suggestedFavourite
  } = useFavouriteSeatStore();

  const { createBooking } = useBookingsStore();
  const router = useNavigate();

  // Initialize store
  useEffect(() => {
    init();
    return () => stopAndClear();
  }, [init, stopAndClear]);

  // Book a seat
  const handleBookSeat = useCallback(async (seat: FavouriteSeat) => {
    const confirmed = await ShowAlert({
      title: "Book Seat",
      description: `Book Desk ${seat.deskNo} in ${seat.room.roomName}?`,
      confirmText: "Yes",
      cancelText: "No",
      isDangerous: false,
    });

    if (confirmed) {
      try {
        const result = await createBooking({
          reserveDeskCode: seat.deskCode,
          type: 'SEAT',
          bookingStartFromNow: true
        });

        if (result?.success) {
          await ShowAlert({
            title: "Success",
            description: "Seat booked successfully!",
            confirmText: "OK",
            isDangerous: false,
          });
        }
      } catch (error) {
        await ShowAlert({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to book seat",
          confirmText: "OK",
          isDangerous: true,
        });
      }
    }
  }, [createBooking]);

  // Remove from favorites
  const handleRemoveFavorite = useCallback(async (seat: FavouriteSeat) => {
    const confirmed = await ShowAlert({
      title: <Icon name="CircleQuestionMark" />,
      description: t('favouriteSeat.removeFromFavorites', { roomName: t(seat.room.roomName), deskNo: t(seat.deskNo) }),
      confirmText: "Yes",
      cancelText: "No",
      isDangerous: true,
    });

    if (confirmed) {
      removeFavouriteSeat(seat.deskCode);
    }
  }, [removeFavouriteSeat, t]);

  // Add to favorites
  const handleAddFavorite = useCallback(async (seat: FavouriteSeat) => {
    if (!checkLimit()) {
      await ShowAlert({
        title: "Limit Reached",
        description: `You can only have ${maxFavouriteSeatsLimit} favorite seats`,
        confirmText: "OK",
        isDangerous: true,
      });
      return;
    }

    const confirmed = await ShowAlert({
      title: "Add Favorite",
      description: `Add ${seat.room.roomName} Desk ${seat.deskNo} to favorites?`,
      confirmText: "Yes",
      cancelText: "No",
      isDangerous: false,
    });

    if (confirmed) {
      prependFavouriteSeat(seat);
    }
  }, [checkLimit, prependFavouriteSeat]);

  // Navigate to room selection
  const handleAddNew = () => {
    router('/ticketing/RoomSelection?catCodes=401,402&newFavourite=true');
  };

  return (
    <div className="min-h-[90vh] bg-gray-50 pb-32">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Settings"
        showBackButton={true}
      />

      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <Text className="text-lg font-bold">{t('favouriteSeat.myFavoriteSeats')}</Text>
          <Text className="text-sm text-gray-600">{t('favouriteSeat.quickAccess')}</Text>
        </div>
        <div className="border border-blue-200 bg-blue-100 rounded-xl px-3 py-1">
          <Text className="text-blue-700 font-semibold text-sm">
            {favouriteSeats.length}/{maxFavouriteSeatsLimit}
          </Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Show content only if there are favorite seats */}
        {favouriteSeats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {/* Favorite Seats */}
            {favouriteSeats.map((seat) => (
              <Card
                key={seat.deskCode}
                className="relative h-36 cursor-pointer hover:bg-gray-50"
                onClick={() => handleBookSeat(seat)}
              >
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(seat);
                  }}
                  className="absolute top-2 right-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full p-1.5 z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <CardContent className="p-3 flex flex-col items-center justify-center h-full">
                  {/* Seat Icon */}
                  <div className="mb-2">
                    <commonIcons.SeatTableIcon
                      width={32}
                      height={32}
                    />
                  </div>

                  {/* Seat Info */}
                  <div className="text-center">
                    <Text className="text-xs text-gray-500 truncate mb-1">
                      {seat.room.floorName} | {t('favouriteSeat.desk')}: {seat.deskNo}
                    </Text>
                    <Text className="font-medium text-sm truncate">
                      {t(seat.room.roomName)}
                    </Text>
                  </div>
                </CardContent>

                {/* Status */}
                <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-center py-1">
                  <Text className="text-xs font-semibold text-white">{t('favouriteSeat.available')}</Text>
                </div>
              </Card>
            ))}

            {/* Add New Button - Show at the end when there are existing favorites */}
            {checkLimit() && (
              <Card
                className="h-36 cursor-pointer hover:bg-gray-50 flex items-center justify-center"
                onClick={handleAddNew}
              >
                <CardContent className="p-3 text-center">
                  <Plus className="w-8 h-8 text-blue-500 mb-2 mx-auto" />
                  <Text className="font-semibold text-sm">{t('favouriteSeat.addFavorite')}</Text>
                  <Text className="text-xs text-gray-500">
                    {maxFavouriteSeatsLimit - favouriteSeats.length} {t('favouriteSeat.slotsLeft')}
                  </Text>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {favouriteSeats.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mb-4 mx-auto" />
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {t('favouriteSeat.noFavoriteSeats')}
            </Text>
            <Text className="text-gray-500 mb-4">
              {t('favouriteSeat.addSeatsToFavorites')}
            </Text>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {t('favouriteSeat.addFavoriteSeat')}
            </button>
          </div>
        )}

      </div>

      {/* Suggestions */}
      {checkLimit() && suggestedFavourite.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-10">
          <Text className="font-semibold mb-3">{t('favouriteSeat.suggestedForYou')}</Text>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedFavourite.slice(0, 10).map((item) => (
              <Card
                key={item.desk.deskCode}
                className="p-3 cursor-pointer hover:bg-gray-50 flex-shrink-0 w-72"
                onClick={() => handleAddFavorite(item.desk)}
              >
                <div className="flex items-center space-x-3">
                  <commonIcons.SeatTableIcon
                    width={24}
                    height={24}
                  />
                  <div className="flex-1 min-w-0">
                    <Text className="font-medium text-sm truncate">
                      {t('favouriteSeat.desk')} {item.desk.deskNo} - {item.desk.room.roomName}
                    </Text>
                    <Text className="text-xs text-gray-500 truncate">
                      {t('favouriteSeat.usedTimes')} {item.times} {t('favouriteSeat.timesSuffix')} {item.days} {t('favouriteSeat.daysSuffix')}
                    </Text>
                  </div>
                  <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
