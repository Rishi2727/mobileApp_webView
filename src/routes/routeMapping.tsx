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
import SeatBookingPage from "@/pages/my-bookings/seat-booking";

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
        title: metadata.seatBooking.title,
         path: metadata.seatBooking.path,
        element: <SeatBookingPage />,
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
