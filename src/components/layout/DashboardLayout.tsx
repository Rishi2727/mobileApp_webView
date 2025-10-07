import { Outlet } from "react-router"
import { DashbaordNavbar } from "../navbar/DashboardNavbar"

export default function DashboardLayout() {
    return (
        // <PrivateRoute>
        <main>
            <DashbaordNavbar />
            <Outlet />
        </main>
        // </PrivateRoute>
    )
}
