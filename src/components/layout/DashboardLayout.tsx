import { Outlet } from "react-router"
import { DashbaordNavbar } from "../navbar/DashboardNavbar"
import { PrivateRoute } from "../core/wrapper/PrivateRouteWrapper"

export default function DashboardLayout() {
    return (
        <PrivateRoute>
            <main>
                <DashbaordNavbar />
                <Outlet />
            </main>
        </PrivateRoute>
    )
}
