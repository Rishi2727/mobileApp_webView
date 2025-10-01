import { Outlet } from "react-router"
import { PrivateRoute } from "../core/wrapper/PrivateRouteWrapper"

export default function AuthorizedLayout() {
    return (
        <PrivateRoute>
            <main>
                <Outlet />
            </main>
        </PrivateRoute>
    )
}
