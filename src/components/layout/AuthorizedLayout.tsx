import { Outlet } from "react-router"
import { Navbar } from "../core/Navbar"
import { PrivateRoute } from "../core/wrapper/PrivateRouteWrapper"

export default function AuthorizedLayout() {
    return (
        <PrivateRoute>
            <main>
                <Navbar />
                <Outlet />
            </main>
        </PrivateRoute>
    )
}
