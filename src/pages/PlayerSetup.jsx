import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PlayerSetup() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingPlayer, setExistingPlayer] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    // Verifica se já existe um jogador no localStorage
    const existingPlayer = localStorage.getItem('player')
    if (existingPlayer) {
      navigate('/')
    }
  }, [navigate])

  const checkExistingPlayer = async (name) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .ilike('name', name.trim())
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (err) {
      console.error('Erro ao verificar jogador:', err)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      setError('Por favor, digite seu nome!')
      return
    }

    if (playerName.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres!')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verifica se já existe um jogador com esse nome
      const existing = await checkExistingPlayer(playerName)
      
      if (existing) {
        setExistingPlayer(existing)
        setShowConfirmation(true)
        setLoading(false)
        return
      }

      // Se não existe, cria novo jogador
      await createNewPlayer()
    } catch (err) {
      console.error('Erro ao criar jogador:', err)
      setError('Erro ao criar jogador. Tente novamente!')
      setLoading(false)
    }
  }

  const createNewPlayer = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ name: playerName.trim(), total_points: 0 }])
        .select()
        .single()

      if (error) throw error

      // Salva o jogador no localStorage
      localStorage.setItem('player', JSON.stringify(data))

      // Redireciona para a home
      navigate('/')
    } catch (err) {
      console.error('Erro ao criar jogador:', err)
      setError('Erro ao criar jogador. Tente novamente!')
      setLoading(false)
    }
  }

  const handleUseExisting = () => {
    // Usa o jogador existente
    localStorage.setItem('player', JSON.stringify(existingPlayer))
    navigate('/')
  }

  const handleChangeNameOption = () => {
    // Volta para editar o nome
    setShowConfirmation(false)
    setExistingPlayer(null)
    setPlayerName('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy via-blue to-navy">
      <div className="max-w-md w-full bg-white-ice rounded-3xl shadow-2xl p-8">
        {!showConfirmation ? (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 emoji">🎯</div>
              <h1 className="text-4xl font-bold text-navy mb-2">
                Bem-vindo!
              </h1>
              <p className="text-lg text-gray-700">
                Digite seu nome para começar a caçar palavras
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="playerName" className="block text-sm font-semibold text-navy mb-2">
                  Seu Nome
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue focus:outline-none text-navy text-lg"
                  maxLength={50}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue to-navy hover:from-navy hover:to-blue text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Começar a Jogar! 🚀'}
              </button>
            </form>

            <div className="mt-6 bg-gradient-to-r from-green-dark to-green-lime rounded-2xl p-4">
              <p className="text-white text-sm text-center">
                💡 <strong>Dica:</strong> Seu progresso será salvo e você poderá competir com outros jogadores!
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-navy mb-4">
                Nome já Existe!
              </h1>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
              <p className="text-yellow-900 mb-4">
                O nome <span className="font-bold text-yellow-800">"{existingPlayer?.name}"</span> já está cadastrado com <span className="font-bold">{existingPlayer?.total_points} pontos</span>.
              </p>
              <p className="text-yellow-900 text-sm">
                Se você continuar com este nome, todos os pontos que você conquistar serão associados a este jogador existente.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUseExisting}
                className="w-full bg-gradient-to-r from-blue to-navy hover:from-navy hover:to-blue text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                ✅ Continuar como "{existingPlayer?.name}"
              </button>

              <button
                onClick={handleChangeNameOption}
                className="w-full bg-white hover:bg-gray-100 text-navy font-bold py-4 px-6 rounded-xl transition-all border-2 border-navy"
              >
                ✏️ Escolher Outro Nome
              </button>
            </div>

            <div className="mt-6 bg-blue/10 rounded-xl p-4">
              <p className="text-blue text-sm text-center">
                💡 Se este é você, continue! Se não, escolha outro nome.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
