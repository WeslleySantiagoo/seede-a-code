import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getPlayer } from '../lib/player'

export default function FoundKeyword() {
  const { keywordId } = useParams()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [alreadyFound, setAlreadyFound] = useState(false)
  const player = getPlayer()

  useEffect(() => {
    fetchKeyword()
  }, [keywordId])

  const fetchKeyword = async () => {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('id', keywordId)
        .single()

      if (error) throw error
      setKeyword(data)

      // Verifica se o jogador já encontrou essa palavra
      if (player) {
        const { data: discovery } = await supabase
          .from('discoveries')
          .select('*')
          .eq('player_id', player.id)
          .eq('keyword_id', keywordId)
          .single()

        setAlreadyFound(!!discovery)
      }
    } catch (err) {
      setError('Palavra não encontrada!')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!keyword || !player) return
    
    setConfirming(true)
    try {
      // Registra a descoberta do jogador
      const { error: discoveryError } = await supabase
        .from('discoveries')
        .insert([{
          player_id: player.id,
          keyword_id: keyword.id,
          discovered_at: new Date().toISOString()
        }])

      if (discoveryError) {
        // Se der erro de duplicata, significa que já encontrou
        if (discoveryError.code === '23505') {
          setAlreadyFound(true)
          return
        }
        throw discoveryError
      }

      // Atualiza os pontos do jogador
      const { error: updateError } = await supabase
        .from('players')
        .update({ 
          total_points: player.total_points + keyword.points 
        })
        .eq('id', player.id)

      if (updateError) throw updateError

      // Atualiza o localStorage
      const updatedPlayer = {
        ...player,
        total_points: player.total_points + keyword.points
      }
      localStorage.setItem('player', JSON.stringify(updatedPlayer))

      // Redireciona para o dashboard
      navigate('/dashboard', { 
        state: { 
          newFind: true, 
          word: keyword.word, 
          points: keyword.points 
        } 
      })
    } catch (err) {
      alert('Erro ao confirmar descoberta: ' + err.message)
      console.error(err)
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-blue to-navy">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-lime"></div>
      </div>
    )
  }

  if (error || !keyword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy via-blue to-navy">
        <div className="max-w-md w-full bg-white-ice rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-navy mb-4">Ops!</h1>
          <p className="text-lg text-gray-700 mb-6">{error || 'Palavra não encontrada'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue hover:bg-navy text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  if (keyword.is_found || alreadyFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy via-blue to-navy">
        <div className="max-w-md w-full bg-white-ice rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-navy mb-4">Já Encontrada!</h1>
          <p className="text-lg text-gray-700 mb-2">
            {alreadyFound 
              ? `Você já encontrou a palavra ${keyword.word}!`
              : `A palavra ${keyword.word} já foi descoberta por você!`
            }
          </p>
          <p className="text-sm text-gray-600 mb-6">Continue procurando outras palavras!</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue hover:bg-navy text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Ver Dashboard
          </button>
        </div>
      </div>
    )
  }

  const getSizeEmoji = (size) => {
    switch(size) {
      case 'small': return '🔥'
      case 'medium': return '⭐'
      case 'large': return '✨'
      default: return '🎯'
    }
  }

  const getSizeLabel = (size) => {
    switch(size) {
      case 'small': return 'Pequeno (Difícil)'
      case 'medium': return 'Médio'
      case 'large': return 'Grande (Fácil)'
      default: return size
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy via-blue to-navy">
      <div className="max-w-md w-full bg-white-ice rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-7xl mb-4 animate-bounce">
          {getSizeEmoji(keyword.size)}
        </div>
        
        <h1 className="text-4xl font-bold text-navy mb-4">
          Parabéns!
        </h1>
        
        <div className="bg-gradient-to-r from-green-dark to-green-lime rounded-2xl p-6 mb-6">
          <p className="text-sm text-white font-semibold mb-2">Você encontrou:</p>
          <h2 className="text-3xl font-bold text-white mb-3">
            {keyword.word}
          </h2>
          <div className="flex items-center justify-center gap-4 text-white">
            <span className="text-5xl font-bold">+{keyword.points}</span>
            <span className="text-lg">pontos</span>
          </div>
        </div>

        <div className="bg-blue/10 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Tamanho:</span> {getSizeLabel(keyword.size)}
          </p>
        </div>

        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full bg-gradient-to-r from-blue to-navy hover:from-navy hover:to-blue text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {confirming ? 'Confirmando...' : 'Confirmar e Ver Pontuação'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 text-blue hover:text-navy font-semibold py-2 transition-all"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  )
}
