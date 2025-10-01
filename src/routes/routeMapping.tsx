import type { RouteObject } from "react-router";
import AuthorizedLayout from "@/components/layout/AuthorizedLayout";
import { metadata } from "@/config/metadata";
import Profile from "@/pages/profile/Profile";
import { PublicOnlyRoute } from "@/components/core/wrapper/PublicRouteWrapper";
import Login from "@/pages/login/Login";

export type RouteObjectExtend = RouteObject & {
  title: string;
  permissionId?: string;
  operationAllowed?: string[];
  children?: RouteObjectExtend[];
};

export const routeMapping: RouteObjectExtend[] = [
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
