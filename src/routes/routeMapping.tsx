import type { RouteObject } from "react-router";
import AuthorizedLayout from "@/components/layout/AuthorizedLayout";
import { metadata } from "@/config/metadata";
import Profile from "@/pages/profile/Profile";
import { PublicOnlyRoute } from "@/components/core/wrapper/PublicRouteWrapper";
import Login from "@/pages/login/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MyBookings from "@/pages/my-bookings/my-bookings";
import Notice from "@/pages/notice/notice";
import SeatBooking from "@/pages/seat-booking/seat-booking";
import SeatBookingPage from "@/pages/seat-booking/seat-booking-page";
import GroupBooking from "@/pages/group-booking/group-booking";
import CarrelBooking from "@/pages/carrel-booking/carrel-booking";
import Message from "@/pages/message/message";
import BookSearch from "@/pages/book-search/book-search";
import BookPurchase from "@/pages/book-purchase/book-purchase";
import LoanHistory from "@/pages/loan-history/loan-history";
import Ebook from "@/pages/e-books/e-book";
import Setting from "@/pages/setting/setting";
import PreferredSeat from "@/pages/setting/preferred-seat";

export type RouteObjectExtend = RouteObject & {
  title: string;
  permissionId?: string;
  operationAllowed?: string[];
  children?: RouteObjectExtend[];
};

export const routeMapping: RouteObjectExtend[] = [
  {
    title: "Dashboard Route",
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        title: metadata.dashboard.title,
        path: metadata.dashboard.path,
        element: <Dashboard />,
      },
    ],
  },
   {
    title: "Private Route",
    path: "/",
    element: <AuthorizedLayout />,
    children: [
      {
        title: metadata.profile.title,
        path: metadata.profile.path,
        element: <Profile />,
      },
      {
        title: metadata.booking.title,
        path: metadata.booking.path,
        element: <MyBookings />,
      },
       {
        title: metadata.notice.title,
        path: metadata.notice.path,
        element: <Notice />,
      },
      {
        title: metadata.seatBooking.title,
        path: metadata.seatBooking.path,
        element: <SeatBooking />,
      },
      {
        title: metadata.seatBookingPage.title,
         path: metadata.seatBookingPage.path,
        element: <SeatBookingPage />,
      },
      {
        title: metadata.groupBooking.title,
         path: metadata.groupBooking.path,
        element: <GroupBooking />,
      },
      {
        title: metadata.carrelBooking.title,
         path: metadata.carrelBooking.path,
        element: <CarrelBooking />,
      },
      {
        title: metadata.message.title,
         path: metadata.message.path,
        element: <Message />,
      },
      {
        title: metadata.bookSearch.title,
         path: metadata.bookSearch.path,
        element: <BookSearch />,
      },
      {
        title: metadata.bookPurchase.title,
         path: metadata.bookPurchase.path,
        element: <BookPurchase />,
      },
      {
        title: metadata.loanHistory.title,
         path: metadata.loanHistory.path,
        element: <LoanHistory />,
      },
      {
        title: metadata.eBook.title,
         path: metadata.eBook.path,
        element: <Ebook />,
      },
      {
        title: metadata.setting.title,
         path: metadata.setting.path,
        element: <Setting />,
      },
      {
        title: metadata.PreferredSeatSetting.title,
         path: metadata.PreferredSeatSetting.path,
        element: <PreferredSeat />,
      },
    ],
  },
  {
    title: "Login",
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
];
