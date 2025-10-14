import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/store/AuthStore";

// To homepage if user is already logged in
export function PublicOnlyRoute({ children }: Readonly<{ children: ReactNode }>) {
    const { isLoggedIn } = useAuthStore();

    if (isLoggedIn()) {
        // Redirect to dashboard if already logged in
        return <Navigate to="/" replace />;
    }

    return children;
}


// For routes that are always accessible regardless of auth status
export function PublicRoute({ children }: Readonly<{ children: ReactNode }>) {
    return children;
}