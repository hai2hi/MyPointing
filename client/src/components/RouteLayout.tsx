import { Outlet } from 'react-router-dom'
import { SocketProvider } from '../context/SocketContext'
import Header from './Header'

export const RouteLayout = () => {
    return (
        <SocketProvider>
            <Header />
            <Outlet />
        </SocketProvider>
    )
}
