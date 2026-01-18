import { Outlet } from 'react-router-dom'
import { SocketProvider } from '../context/SocketContext'

export const RouteLayout = () => {
    return (
        <SocketProvider>
            <Outlet />
        </SocketProvider>
    )
}
