import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getPlayer, clearPlayer } from '../lib/player'
import Ranking from '../components/Ranking'

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [keywords, setKeywords] = useState([])
  const [myDiscoveries, setMyDiscoveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const player = getPlayer()

  useEffect(() => {
    fetchData()
    
    // Mostra animação se vier de uma nova descoberta
    if (location.state?.newFind) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [location])

  const fetchData = async () => {
    try {
      // Busca todas as palavras
      const { data: keywordsData, error: keywordsError } = await supabase
        .from('keywords')
        .select('*')
        .order('points', { ascending: false })

      if (keywordsError) throw keywordsError

      // Busca TODAS as descobertas (de todos os jogadores) com informações do jogador
      const { data: allDiscoveriesData, error: allDiscoveriesError } = await supabase
        .from('discoveries')
        .select(`
          keyword_id,
          discovered_at,
          player:players(id, name)
        `)

      if (allDiscoveriesError) throw allDiscoveriesError

      // Busca as descobertas do jogador atual
      if (player) {
        const { data: myDiscoveriesData, error: myDiscoveriesError } = await supabase
          .from('discoveries')
          .select('keyword_id, discovered_at')
          .eq('player_id', player.id)

        if (myDiscoveriesError) throw myDiscoveriesError
        setMyDiscoveries(myDiscoveriesData || [])
      }

      // Adiciona informação de quem descobriu cada palavra
      const keywordsWithDiscoveries = keywordsData.map(keyword => {
        const discoveries = allDiscoveriesData.filter(d => d.keyword_id === keyword.id)
        return {
          ...keyword,
          discoveries: discoveries.map(d => ({
            player_name: d.player?.name,
            discovered_at: d.discovered_at
          }))
        }
      })

      setKeywords(keywordsWithDiscoveries || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair? Seu progresso estará salvo.')) {
      clearPlayer()
      navigate('/setup')
    }
  }

  // Verifica se o jogador encontrou determinada palavra
  const hasFound = (keywordId) => {
    return myDiscoveries.some(d => d.keyword_id === keywordId)
  }

  // Calcula pontos do jogador (do localStorage atualizado)
  const myPoints = player?.total_points || 0
  const myFoundCount = myDiscoveries.length
  const totalCount = keywords.length
  const progress = totalCount > 0 ? (myFoundCount / totalCount) * 100 : 0

  const getSizeEmoji = (size) => {
    switch(size) {
      case 'small': return '🔥'
      case 'medium': return '⭐'
      case 'large': return '✨'
      default: return '🎯'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-blue to-navy">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-lime"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-blue to-navy p-4 pb-8">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-9xl animate-ping">🎉</div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header com nome do jogador */}
        <div className="bg-white-ice rounded-3xl shadow-2xl p-6 mb-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-3xl font-bold text-navy">
              🏆 Minha Pontuação
            </h1>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-all"
              title="Sair"
            >
              🚪
            </button>
          </div>

          <p className="text-lg text-gray-700 mb-4">
            Olá, <span className="font-bold text-blue">{player?.name}</span>!
          </p>
          
          <div className="bg-gradient-to-r from-green-dark to-green-lime rounded-2xl p-6 mb-4">
            <div className="text-6xl font-bold text-white mb-2">
              {myPoints}
            </div>
            <p className="text-white text-lg font-semibold">Pontos Totais</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
            <span>Progresso</span>
            <span className="font-bold">{myFoundCount}/{totalCount} palavras</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue to-green-lime h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Ranking */}
        <div className="mb-6">
          <Ranking />
        </div>

        {/* Lista de Palavras */}
        <div className="bg-white-ice rounded-3xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-navy mb-2">Todas as Palavras</h2>
          <p className="text-sm text-gray-600 mb-4">
            {myFoundCount} de {totalCount} encontradas por você
          </p>
          
          {keywords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma palavra cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {keywords.map((keyword) => {
                const foundByMe = hasFound(keyword.id)
                const myDiscovery = myDiscoveries.find(d => d.keyword_id === keyword.id)
                const isFound = keyword.discoveries && keyword.discoveries.length > 0
                
                return (
                  <div
                    key={keyword.id}
                    className={`rounded-xl p-4 transition-all ${
                      foundByMe
                        ? 'bg-gradient-to-r from-green-dark/20 to-green-lime/20 border-2 border-green-dark'
                        : isFound
                        ? 'bg-blue/10 border-2 border-blue/30'
                        : 'bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">
                          {foundByMe ? '✅' : isFound ? '👁️' : '🔒'}
                        </span>
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${
                            isFound ? 'text-navy' : 'text-gray-400'
                          }`}>
                            {isFound ? keyword.word : '???'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getSizeEmoji(keyword.size)} {keyword.size} • {keyword.points} pts
                          </p>
                          
                          {/* Mostra quem encontrou */}
                          {isFound && keyword.discoveries.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {keyword.discoveries.map((discovery, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    discovery.player_name === player?.name
                                      ? 'bg-green-dark text-white font-semibold'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {discovery.player_name === player?.name ? '🎉 Você' : discovery.player_name}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {!isFound && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ainda não foi encontrada por ninguém
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {foundByMe && myDiscovery?.discovered_at && (
                        <div className="text-xs text-gray-500 text-right ml-2">
                          <span className="font-semibold text-green-dark">Você achou!</span>
                          <br />
                          {new Date(myDiscovery.discovered_at).toLocaleDateString('pt-BR')}
                          <br />
                          {new Date(myDiscovery.discovered_at).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Botão de Voltar */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 bg-white-ice hover:bg-gray-100 text-navy font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
        >
          ← Voltar ao Início
        </button>

        {/* Mensagem de conclusão */}
        {myFoundCount === totalCount && totalCount > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-dark to-green-lime rounded-2xl p-6 text-center">
            <p className="text-3xl mb-2">🎊</p>
            <h3 className="text-2xl font-bold text-white mb-2">
              Parabéns!
            </h3>
            <p className="text-white">
              Você encontrou todas as palavras!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
