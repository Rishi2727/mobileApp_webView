import { Outlet } from "react-router"
import { PrivateRoute } from "../core/wrapper/PrivateRouteWrapper"
import { Navbar } from "../core/Navbar"

export default function AuthorizedLayout() {
    return (
        // <PrivateRoute>
        <main>
            <Navbar />
            <Outlet />
        </main>
        // </PrivateRoute>
    )
}
