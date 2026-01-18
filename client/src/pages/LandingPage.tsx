import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import '../css/App.css'

import Header from '../components/Header'

function LandingPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roomUrl, setRoomUrl] = useState('')

  const handleJoin = () => {
    if (!roomUrl) return

    // Extract gameId from URL if it's a full URL
    let gameId = roomUrl
    try {
      const url = new URL(roomUrl)
      const pathParts = url.pathname.split('/')
      const gameIndex = pathParts.indexOf('game')
      if (gameIndex !== -1 && pathParts[gameIndex + 1]) {
        gameId = pathParts[gameIndex + 1]
      }
    } catch {
      // Not a URL, use as is (assuming it's a gameId)
    }

    navigate(PATHS.GAME.replace(':gameId', gameId))
  }

  return (
    <div className="app-container">
      <Header />

      <main>
        <section id='start-new' className="section hero">
          <div className="container">
            <h1 className="hero-title">
              Planning poker
            </h1>
            <button type='button' className="btn-primary" onClick={() => navigate(PATHS.NEW_SESSION)}>Start New Session</button>
          </div>
        </section>

        <section id="join-room" className="section">
          <div className="container">
            <h2 className="section-title">Join room</h2>
            <button type="button" className="btn-outline btn-lg" onClick={() => setIsModalOpen(true)}>Join Existing Room</button>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Join Existing Room</h2>
            <div className="form-group">
              <label className="form-label">Room URL or ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter room URL or ID..."
                value={roomUrl}
                onChange={(e) => setRoomUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleJoin} disabled={!roomUrl}>Join Room</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div>© 2026 MyPointing. All rights reserved.</div>
      </footer>
    </div>
  )
}

export default LandingPage
