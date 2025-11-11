import { createBrowserRouter, RouterProvider, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { routeMapping } from "./routeMapping";
import { setNavigateRef } from "@/lib/navigation";

function NavigationSetup() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Set the navigate reference for use outside React components
        setNavigateRef(navigate);
    }, [navigate]);
    
    return null;
}

export function MyRouter() {
    const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter> | null>(null);

    useEffect(() => {
        const basePath = import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') || '';
        
        // Add NavigationSetup component to all routes
        const routesWithNav = routeMapping.map(route => ({
            ...route,
            element: (
                <>
                    <NavigationSetup />
                    {route.element}
                </>
            )
        }));
        
        const newRouter = createBrowserRouter(routesWithNav, {
            basename: basePath
        });
        setRouter(newRouter);
    }, []);

    if (!router) {
        return null;
    }

    return <RouterProvider router={router} />;
}