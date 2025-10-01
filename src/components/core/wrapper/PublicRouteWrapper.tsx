import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { storage } from "@/lib/storage";

// To homepage if user is already logged in
export function PublicOnlyRoute({ children }: Readonly<{ children: ReactNode }>) {
    const isAuthenticated = () => {
        const token = storage.get('AUTH_TOKEN')
        return !!token;
    };

    if (isAuthenticated()) {
        // Redirect to dashboard if already logged in
        return <Navigate to="/" replace />;
    }

    return children;
}


// For routes that are always accessible regardless of auth status
export function PublicRoute({ children }: Readonly<{ children: ReactNode }>) {
    return children;
}