import { createBrowserRouter, RouterProvider } from "react-router";
import { useEffect, useState } from "react";
import { routeMapping } from "./routeMapping";

export function MyRouter() {
    const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter> | null>(null);

    useEffect(() => {
        const basePath = import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') || '';
        const newRouter = createBrowserRouter(routeMapping, {
            basename: basePath
        });
        setRouter(newRouter);
    }, []);

    if (!router) {
        return null;
    }

    return <RouterProvider router={router} />;
}