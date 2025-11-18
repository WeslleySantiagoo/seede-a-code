import { Link, useNavigate } from 'react-router-dom'
import { getPlayer, clearPlayer } from '../lib/player'

export default function Home() {
  const navigate = useNavigate()
  const player = getPlayer()

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair? Seu progresso estará salvo.')) {
      clearPlayer()
      navigate('/setup')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-navy via-blue to-navy">
      <div className="max-w-md w-full bg-white-ice rounded-3xl shadow-2xl p-8 text-center">
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <h1 className="text-4xl font-bold text-navy">
            <span className="emoji">🎯</span> Caça às Palavras
          </h1>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 transition-all text-sm emoji"
            title="Sair"
          >
            🚪
          </button>
        </div>

        <p className="text-lg text-gray-700 mb-2">
          Olá, <span className="font-bold text-blue">{player?.name}</span>!
        </p>
        
        <p className="text-base text-gray-600 mb-8">
          Escaneie os QR codes espalhados pela Imersão para encontrar as palavras-chave e ganhar pontos!
        </p>
        
        <div className="bg-gradient-to-r from-green-dark to-green-lime rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Como Jogar?</h2>
          <ul className="text-white text-left space-y-2">
            <li>✓ Encontre os QR codes escondidos</li>
            <li>✓ Escaneie com seu celular</li>
            <li>✓ Confirme a palavra encontrada</li>
            <li>✓ Acumule pontos e vença!</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            to="/dashboard"
            className="block w-full bg-blue hover:bg-navy text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Ver Minha Pontuação
          </Link>
          
          <p className="text-sm text-gray-600 mt-4">
            QR codes menores valem mais pontos! <span className="emoji">🏆</span>
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Que comecem as caças!

          </p>
        </div>
      </div>
    </div>
  )
}
