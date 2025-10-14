import { Navigate, useLocation } from "react-router";
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAuthStore } from "@/store/AuthStore";
import { Loader } from "@/components/ui/custom/loader";

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? Math.floor(Date.now() / 1000) >= payload.exp : false;
    } catch {
        return true;
    }
}

export function PrivateRoute({ children }: Readonly<{ children: ReactNode }>) {
    const location = useLocation();
    const { token, isLoggedIn, logout, mustLoggedIn } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setIsChecking(true);
            
            // Check if user must be logged in (this handles token validation and redirects)
            await mustLoggedIn();
            
            if (token && isTokenExpired(token)) {
                logout();
                return;
            }
            
            setIsChecking(false);
        };

        checkAuth();
    }, [token, logout, mustLoggedIn]);

    // Show loading while checking authentication
    if (isChecking) {
        return <Loader fullScreen />;
    }

    // If not logged in, redirect to login
    if (!isLoggedIn()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render children
    return <>{children}</>;
}