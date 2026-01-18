import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import NewSessionPage from './pages/NewSessionPage'
import GamePage from './pages/GamePage'
import JoinRoomPage from './pages/JoinRoomPage'
import { PATHS } from './constants/paths'
import { RouteLayout } from './components/RouteLayout'

export const router = createBrowserRouter([
    {
        element: <RouteLayout />,
        children: [
            {
                path: PATHS.HOME,
                element: <LandingPage />,
            },
            {
                path: PATHS.NEW_SESSION,
                element: <NewSessionPage />,
            },
            {
                path: PATHS.GAME,
                element: <GamePage />,
            },
            {
                path: PATHS.JOIN,
                element: <JoinRoomPage />,
            },
            {
                path: '*',
                element: <Navigate to={PATHS.HOME} replace />,
            }
        ]
    }
])
