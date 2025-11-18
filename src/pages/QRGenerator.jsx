import { QRCodeSVG } from 'qrcode.react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { jsPDF } from 'jspdf'
import QRCodeStyling from 'qr-code-styling'

export default function QRGenerator() {
  const navigate = useNavigate()
  const [keywords, setKeywords] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [useCustomStyle, setUseCustomStyle] = useState(true)
  const qrRefs = useRef({})

  useEffect(() => {
    fetchKeywords()
  }, [])

  useEffect(() => {
    if (keywords.length > 0 && useCustomStyle) {
      // Timeout para garantir que o DOM foi renderizado
      setTimeout(() => {
        generateStyledQRCodes()
      }, 100)
    }
  }, [keywords, useCustomStyle])

  const generateStyledQRCodes = () => {
    console.log('Gerando QR codes customizados para', keywords.length, 'palavras')
    
    keywords.forEach(keyword => {
      const qrUrl = `${window.location.origin}/found/${keyword.id}`
      const qrSize = getQRSize(keyword.size)
      
      console.log(`Gerando QR para ${keyword.word} (${qrSize}px)`)
      
      const qrCode = new QRCodeStyling({
        width: qrSize,
        height: qrSize,
        data: qrUrl,
        margin: 5,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'M'
        },
        imageOptions: {
          hideBackgroundDots: false,
          imageSize: 0.2
        },
        dotsOptions: {
          type: 'square',
          color: '#063472'
        },
        backgroundOptions: {
          color: '#ffffff'
        },
        cornersSquareOptions: {
          type: 'square',
          color: 'rgb(174, 189, 36)'
        },
        cornersDotOptions: {
          type: 'square',
          color: 'rgb(174, 189, 36)'
        },
        image: '/blue-macaw.svg'
      })

      const container = document.getElementById(`qr-styled-${keyword.id}`)
      if (container) {
        console.log(`Container encontrado para ${keyword.word}`)
        container.innerHTML = ''
        qrCode.append(container)
        qrRefs.current[keyword.id] = qrCode
      } else {
        console.error(`Container não encontrado: qr-styled-${keyword.id}`)
      }
    })
  }

  const fetchKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .order('points', { ascending: false })

      if (error) throw error
      setKeywords(data)
    } catch (err) {
      console.error('Erro ao carregar palavras:', err)
    } finally {
      setLoading(false)
    }
  }

  const getQRSize = (size) => {
    switch(size) {
      case 'small': return 100  // Pequeno
      case 'medium': return 130 // Médio
      case 'large': return 175  // Grande
      default: return 130
    }
  }

  const downloadQR = async (keywordId, word) => {
    if (useCustomStyle && qrRefs.current[keywordId]) {
      // Download QR customizado
      await qrRefs.current[keywordId].download({
        name: `QR_${word}_${keywordId}`,
        extension: 'png'
      })
    } else {
      // Download QR simples
      const canvas = document.getElementById(`qr-${keywordId}`)
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream')
      
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `QR_${word}_${keywordId}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const downloadAll = async () => {
    setGenerating(true)
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = 210 // A4 width em mm
      const pageHeight = 297 // A4 height em mm
      const margin = 15
      const usableWidth = pageWidth - (margin * 2)
      const usableHeight = pageHeight - (margin * 2)

      let currentY = margin
      let currentX = margin
      let maxHeightInRow = 0
      let isFirstItem = true

      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i]
        const qrSize = getQRSize(keyword.size)
        const qrUrl = `${window.location.origin}/found/${keyword.id}`

        // Converte tamanho em mm
        const mmSize = qrSize * 0.26458 // Conversão de px para mm (96 DPI)
        const blockWidth = mmSize + 10 // QR + margem de segurança lateral
        const blockHeight = mmSize + 18 // QR + margem de segurança vertical (textos)

        // Verifica se precisa quebrar linha
        if (currentX + blockWidth > pageWidth - margin && !isFirstItem) {
          currentX = margin
          currentY += maxHeightInRow + 3
          maxHeightInRow = 0
        }

        // Verifica se precisa de nova página
        if (currentY + blockHeight > pageHeight - margin) {
          pdf.addPage()
          currentY = margin
          currentX = margin
          maxHeightInRow = 0
        }

        let imgData
        
        if (useCustomStyle && qrRefs.current[keyword.id]) {
          // Usa QR customizado
          try {
            const blob = await qrRefs.current[keyword.id].getRawData('png')
            if (blob) {
              imgData = await new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result)
                reader.readAsDataURL(blob)
              })
            }
          } catch (error) {
            console.error('Erro ao gerar QR customizado para PDF:', error)
            // Fallback para QR simples
            useCustomStyle = false
          }
        }
        
        if (!imgData) {
          // Usa QR simples (SVG)
          const svgElement = document.getElementById(`qr-${keyword.id}`)
          if (!svgElement) {
            console.error(`QR code não encontrado: qr-${keyword.id}`)
            continue
          }
          
          const svgData = new XMLSerializer().serializeToString(svgElement)
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()

          imgData = await new Promise((resolve) => {
            img.onload = () => {
              canvas.width = qrSize
              canvas.height = qrSize
              
              ctx.fillStyle = 'white'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.drawImage(img, 0, 0)
              
              resolve(canvas.toDataURL('image/png'))
            }
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
          })
        }

        // Centro do bloco
        const blockCenterX = currentX + (mmSize / 2)
        
        // Adiciona palavra (pequena, sutil, acima do QR) - com limite de largura
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(100)
        const titleText = `${keyword.word} - ${keyword.points}pts`
        const titleLines = pdf.splitTextToSize(titleText, mmSize - 2) // 2mm de margem interna
        pdf.text(titleLines, blockCenterX, currentY + 4, { align: 'center', maxWidth: mmSize - 2 })
        
        // Adiciona o QR code
        const qrY = currentY + 8
        pdf.addImage(imgData, 'PNG', currentX, qrY, mmSize, mmSize)
        
        // Adiciona URL abaixo do QR code (com limite de largura)
        pdf.setFontSize(5)
        pdf.setTextColor(80)
        const urlLines = pdf.splitTextToSize(qrUrl, mmSize - 2) // 2mm de margem interna
        pdf.text(urlLines, blockCenterX, qrY + mmSize + 2.5, { align: 'center', maxWidth: mmSize - 2 })
        
        // Atualiza posições
        maxHeightInRow = Math.max(maxHeightInRow, blockHeight)
        currentX += blockWidth
        isFirstItem = false
      }

      // Salva o PDF
      pdf.save('QR_Codes_Caca_Palavras.pdf')
      
      alert(`✅ PDF gerado com sucesso! ${keywords.length} QR codes foram incluídos.`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('❌ Erro ao gerar PDF. Tente novamente!')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue"></div>
      </div>
    )
  }

  // URL base do seu projeto (ALTERAR PARA SUA URL DE PRODUÇÃO)
  const baseUrl = window.location.origin

  return (
    <div className="min-h-screen bg-white-ice p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-navy to-blue rounded-3xl p-8 mb-8 text-white text-center">
          <h1 className="text-4xl font-bold mb-4"><span className="emoji">🎯</span> Gerador de QR Codes</h1>
          <p className="text-lg mb-4">
            Imprima e esconda os QR codes pelo evento!
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all">
              <input
                type="checkbox"
                checked={useCustomStyle}
                onChange={(e) => setUseCustomStyle(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-semibold">✨ Usar QR Codes Customizados</span>
            </label>
          </div>
          
          <button
            onClick={downloadAll}
            disabled={generating}
            className="mt-4 bg-green-lime hover:bg-green-dark text-navy font-bold py-3 px-8 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '⏳ Gerando PDF...' : '📄 Baixar Todos em PDF'}
          </button>
        </div>

        {keywords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhuma palavra cadastrada. Configure o banco de dados primeiro!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keywords.map((keyword) => {
              const qrUrl = `${baseUrl}/found/${keyword.id}`
              const qrSize = getQRSize(keyword.size)
              
              return (
                <div
                  key={keyword.id}
                  className="bg-white rounded-2xl shadow-xl p-6 text-center border-4 border-navy"
                >
                  <div className="bg-gradient-to-r from-green-dark to-green-lime rounded-xl p-4 mb-4">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {keyword.word}
                    </h3>
                    <p className="text-white text-sm">
                      {keyword.points} pontos • {keyword.size}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl mb-4 inline-block">
                    {useCustomStyle ? (
                      <>
                        <div id={`qr-styled-${keyword.id}`} className="flex items-center justify-center min-h-[100px]"></div>
                        {/* QR simples escondido como fallback */}
                        <div style={{ display: 'none' }}>
                          <QRCodeSVG
                            id={`qr-${keyword.id}`}
                            value={qrUrl}
                            size={qrSize}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                      </>
                    ) : (
                      <QRCodeSVG
                        id={`qr-${keyword.id}`}
                        value={qrUrl}
                        size={qrSize}
                        level="H"
                        includeMargin={true}
                      />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-3 break-all">
                    {qrUrl}
                  </p>

                  <button
                    onClick={() => downloadQR(keyword.id, keyword.word)}
                    className="w-full bg-blue hover:bg-navy text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    📥 Baixar QR Code
                  </button>

                  <div className="mt-3 text-sm text-gray-600">
                    Tamanho: {qrSize}x{qrSize}px
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-12 bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-3">
            💡 Dicas para o Evento:
          </h2>
          <ul className="space-y-2 text-yellow-900">
            <li>• <strong>Small (50pts):</strong> Esconda em lugares difíceis ou altos - QR menor (100x100px)</li>
            <li>• <strong>Medium (30pts):</strong> Lugares de dificuldade média - QR médio (130x130px)</li>
            <li>• <strong>Large (20pts):</strong> Lugares mais visíveis e fáceis - QR grande (175x175px)</li>
            <li>• <strong>PDF:</strong> Múltiplos QR codes por página, otimizado para impressão</li>
            <li>• Imprima em papel de qualidade para melhor leitura</li>
            <li>• Use plástico ou adesivos para proteger os QR codes</li>
            <li>• Teste todos os QR codes antes do evento!</li>
          </ul>
        </div>

        {useCustomStyle && (
          <div className="mt-12 bg-gradient-to-r from-blue to-navy text-white rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">
              ✨ Personalização dos QR Codes
            </h2>
            <div className="space-y-2 text-sm">
              <p>• <strong>Pontos dos quadrados:</strong> Gradiente Navy → Blue</p>
              <p>• <strong>Cantos quadrados:</strong> Verde escuro (extra-rounded)</p>
              <p>• <strong>Pontos dos cantos:</strong> Verde limão (dot style)</p>
              <p>• <strong>Logo central:</strong> blue-macaw.svg</p>
              <p>• <strong>Tipo de pontos:</strong> Arredondados (rounded)</p>
            </div>
            <p className="mt-4 text-xs opacity-80">
              💡 Para personalizar ainda mais, edite a função <code className="bg-white/20 px-2 py-1 rounded">generateStyledQRCodes()</code> no arquivo QRGenerator.jsx
            </p>
          </div>
        )}

        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 bg-white hover:bg-gray-100 text-navy font-bold py-4 px-6 rounded-xl transition-all shadow-lg border-2 border-navy"
        >
          ← Voltar ao Início
        </button>
      </div>
    </div>
  )
}
