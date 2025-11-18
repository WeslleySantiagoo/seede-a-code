import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import FoundKeyword from './pages/FoundKeyword'
import Dashboard from './pages/Dashboard'
import QRGenerator from './pages/QRGenerator'
import PlayerSetup from './pages/PlayerSetup'
import { isPlayerLoggedIn } from './lib/player'

// Componente para proteger rotas que precisam de jogador
function ProtectedRoute({ children }) {
  return isPlayerLoggedIn() ? children : <Navigate to="/setup" replace />
}

function App() {
  return (
    <div className="min-h-screen bg-white-ice">
      <Routes>
        <Route path="/setup" element={<PlayerSetup />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/found/:keywordId" element={<ProtectedRoute><FoundKeyword /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/generate-qr" element={<QRGenerator />} />
      </Routes>
    </div>
  )
}

export default App
