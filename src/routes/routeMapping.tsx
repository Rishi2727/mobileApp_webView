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
import Message from "@/pages/message/message";
import Setting from "@/pages/setting/setting";
import PreferredSeat from "@/pages/setting/preferred-seat";
import ExternalUser from "@/pages/external-user/external-user";
import RoomSelection from "@/pages/ticketing/RoomSelection";
import SeatSelection from "@/pages/ticketing/SeatSelection";
import DisplayTimeChart from "@/pages/ticketing/DisplayTimeChart";
import TimeAndUserPicker from "@/pages/ticketing/TimeAndUserPicker";

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
        element: <RoomSelection />,
      },
      {
        title: metadata.groupBooking.title,
        path: metadata.groupBooking.path,
        element: <RoomSelection />,
      },
      {
        title: metadata.carrelBooking.title,
        path: metadata.carrelBooking.path,
        element: <RoomSelection />,
      },
      {
        title: metadata.message.title,
        path: metadata.message.path,
        element: <Message />,
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
      // Ticketing System Routes
      {
        title: metadata.ticketingRoomSelection.title,
        path: metadata.ticketingRoomSelection.path,
        element: <RoomSelection />,
      },
      {
        title: metadata.ticketingSeatSelection.title,
        path: metadata.ticketingSeatSelection.path,
        element: <SeatSelection />,
      },
      {
        title: metadata.ticketingDisplayTimeChart.title,
        path: metadata.ticketingDisplayTimeChart.path,
        element: <DisplayTimeChart />,
      },
      {
        title: metadata.ticketingTimeAndUserPicker.title,
        path: metadata.ticketingTimeAndUserPicker.path,
        element: <TimeAndUserPicker />,
      },
    ],
  },
  {
    title: "One Day Pass",
    path: "/one-day-pass",
    element: (
      <PublicOnlyRoute>
        <ExternalUser />
      </PublicOnlyRoute>
    ),
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
