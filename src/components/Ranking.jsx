import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getPlayer } from '../lib/player'

export default function Ranking() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const currentPlayer = getPlayer()

  useEffect(() => {
    fetchRanking()
  }, [])

  const fetchRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('total_points', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10)

      if (error) throw error
      setPlayers(data || [])
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMedalEmoji = (position) => {
    switch(position) {
      case 1: return <span className="emoji">🥇</span>
      case 2: return <span className="emoji">🥈</span>
      case 3: return <span className="emoji">🥉</span>
      default: return `${position}º`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue"></div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="bg-white-ice rounded-2xl shadow-xl p-6 text-center">
        <p className="text-gray-500">Nenhum jogador ainda. Seja o primeiro!</p>
      </div>
    )
  }

  return (
    <div className="bg-white-ice rounded-3xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-navy mb-4 text-center flex items-center justify-center gap-2">
        <span className="emoji">🏆</span> Ranking de Jogadores
      </h2>
      
      <div className="space-y-3">
        {players.map((player, index) => {
          const position = index + 1
          const isCurrentPlayer = currentPlayer && player.id === currentPlayer.id
          
          return (
            <div
              key={player.id}
              className={`rounded-xl p-4 transition-all ${
                isCurrentPlayer
                  ? 'bg-gradient-to-r from-green-dark/30 to-green-lime/30 border-2 border-green-dark shadow-lg'
                  : position <= 3
                  ? 'bg-gradient-to-r from-blue/10 to-blue/20 border-2 border-blue/30'
                  : 'bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${
                    position <= 3 ? 'text-3xl' : 'text-navy'
                  }`}>
                    {getMedalEmoji(position)}
                  </span>
                  
                  <div>
                    <h3 className={`font-bold text-lg ${
                      isCurrentPlayer ? 'text-green-dark' : 'text-navy'
                    }`}>
                      {player.name}
                      {isCurrentPlayer && (
                        <span className="ml-2 text-sm font-normal text-green-dark">
                          (Você)
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {player.total_points} pontos
                    </p>
                  </div>
                </div>

                {position <= 3 && (
                  <div className={`text-4xl emoji ${
                    position === 1 ? 'animate-bounce' : ''
                  }`}>
                    {position === 1 && '👑'}
                    {position === 2 && '⭐'}
                    {position === 3 && '✨'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {currentPlayer && !players.find(p => p.id === currentPlayer.id) && (
        <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
          <p className="text-yellow-800 text-sm">
            Continue jogando para entrar no Top 10! 🚀
          </p>
        </div>
      )}
    </div>
  )
}
