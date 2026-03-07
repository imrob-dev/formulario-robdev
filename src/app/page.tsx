'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Check, 
  Building2,
  Users,
  Settings,
  Clock,
  Target,
  Linkedin,
  Code2,
  ExternalLink,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

interface Question {
  id: string
  type: 'text' | 'textarea' | 'select' | 'number'
  question: string
  helperText?: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface Section {
  id: string
  title: string
  emoji: string
  icon: React.ReactNode
  color: string
  questions: Question[]
}

const sections: Section[] = [
  {
    id: 'clinica',
    title: 'Sobre a Clínica',
    emoji: '🔥',
    icon: <Building2 className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    questions: [
      {
        id: 'especialidade',
        type: 'text',
        question: 'Qual é a especialidade principal da clínica?',
        helperText: 'Ex: Fisioterapia, Fonoaudiologia, Terapia Ocupacional, Reabilitação pós-cirúrgica, etc.',
        placeholder: 'Digite a especialidade...'
      },
      {
        id: 'pacientes_dia',
        type: 'text',
        question: 'Quantos pacientes vocês atendem mais ou menos por dia ou por semana?',
        placeholder: 'Ex: 20 pacientes por dia, 100 por semana...'
      },
      {
        id: 'maior_dor',
        type: 'textarea',
        question: 'Qual é a maior "dor" ou problema que você quer resolver hoje?',
        helperText: 'Ex: A agenda vive bagunçada, perdemos papéis, não sabemos quanto dinheiro entra/sai, é difícil acompanhar a evolução do paciente.',
        placeholder: 'Descreva o principal problema...'
      },
      {
        id: 'pacientes_principais',
        type: 'text',
        question: 'Quem são os seus pacientes principais?',
        helperText: 'Ex: Particulares, Convênios (quais?), SUS, Empresas.',
        placeholder: 'Descreva o perfil dos pacientes...'
      },
      {
        id: 'objetivo',
        type: 'textarea',
        question: 'Qual o seu principal objetivo com esse novo sistema?',
        helperText: 'Ex: Atender mais gente, organizar as finanças, não perder pacientes, ter mais controle.',
        placeholder: 'Descreva o objetivo principal...'
      }
    ]
  },
  {
    id: 'equipe',
    title: 'Rotina da Equipe',
    emoji: '👥',
    icon: <Users className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    questions: [
      {
        id: 'qtd_pessoas',
        type: 'text',
        question: 'Quantas pessoas trabalham na clínica?',
        helperText: 'Separe por função: Ex: 3 fisioterapeutas, 1 recepcionista, 1 gerente.',
        placeholder: 'Ex: 2 fisioterapeutas, 1 recepcionista...'
      },
      {
        id: 'tarefas_equipe',
        type: 'textarea',
        question: 'O que cada pessoa precisa fazer no dia a dia que o sistema poderia ajudar?',
        helperText: 'Recepção: Marcar consultas, receber pagamentos? Terapeutas: Anotar a evolução do paciente, ver a história de atendimento? Gestor: Ver relatórios de faturamento, controlar metas?',
        placeholder: 'Descreva as necessidades de cada função...'
      },
      {
        id: 'ferramentas_atuais',
        type: 'textarea',
        question: 'Vocês usam alguma ferramenta hoje?',
        helperText: 'Ex: Caderninho, planilhas Excel, Google Agenda, outro sistema? O que você gosta e o que não gosta nisso que usam hoje?',
        placeholder: 'Descreva as ferramentas atuais...'
      },
      {
        id: 'tarefas_manuais',
        type: 'textarea',
        question: 'Existe alguma tarefa manual e chata que vocês querem eliminar?',
        helperText: 'Ex: Ter que copiar dados do papel para o computador, ficar ligando para lembrar paciente de consulta.',
        placeholder: 'Descreva as tarefas que deseja eliminar...'
      }
    ]
  },
  {
    id: 'sistema',
    title: 'Como o Sistema Vai Funcionar',
    emoji: '⚙️',
    icon: <Settings className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-800',
    questions: [
      {
        id: 'onde_acessar',
        type: 'textarea',
        question: 'Onde vocês vão precisar acessar o sistema?',
        helperText: 'Ex: Apenas no computador da recepção? Precisam acessar pelo celular durante o atendimento? Precisa ser um aplicativo que baixa na loja ou pode ser pelo navegador de internet?',
        placeholder: 'Descreva onde precisarão acessar...'
      },
      {
        id: 'forma_acesso',
        type: 'text',
        question: 'Como as pessoas vão entrar no sistema?',
        helperText: 'Ex: Login e senha tradicionais, ou entrar com a conta do Google?',
        placeholder: 'Ex: Login/senha ou conta Google...'
      },
      {
        id: 'pagamentos',
        type: 'textarea',
        question: 'Como vocês recebem os pagamentos hoje?',
        helperText: 'Ex: Maquininha de cartão (PagSeguro, Mercado Pago), PIX, dinheiro, ou só controlam para receber dos convênios depois? O sistema precisa conectar com alguma maquininha?',
        placeholder: 'Descreva como recebem pagamentos...'
      },
      {
        id: 'integracoes',
        type: 'textarea',
        question: 'O sistema precisa se conectar com outras ferramentas?',
        helperText: 'Ex: Mandar lembretes automáticos pelo WhatsApp, sincronizar com a agenda do Google?',
        placeholder: 'Descreva as integrações necessárias...'
      },
      {
        id: 'relatorios',
        type: 'textarea',
        question: 'Que tipo de informação vocês precisam ver nos relatórios?',
        helperText: 'Ex: Coisas simples como "quanto entrou hoje", ou coisas mais detalhadas como "evolução do paciente" e "metas da equipe"?',
        placeholder: 'Descreva os relatórios desejados...'
      },
      {
        id: 'prontuario',
        type: 'textarea',
        question: 'Sobre o prontuário (ficha do paciente):',
        helperText: 'Vocês precisam anexar fotos ou vídeos da evolução? Precisam assinar documentos digitalmente (na tela do celular/computador)?',
        placeholder: 'Descreva as necessidades do prontuário...'
      },
      {
        id: 'aparencia',
        type: 'text',
        question: 'Sobre a aparência do sistema:',
        helperText: 'Vocês já têm logotipo e cores definidas da clínica, ou precisam que a gente crie essa identidade visual do zero?',
        placeholder: 'Ex: Já temos logo e cores, ou precisamos criar...'
      },
      {
        id: 'convenios',
        type: 'textarea',
        question: 'Sobre Convênios:',
        helperText: 'Vocês atendem muito por convênio? Cada convênio tem uma regra diferente de cobrança que o sistema precisa saber?',
        placeholder: 'Descreva como funcionam os convênios...'
      }
    ]
  },
  {
    id: 'prazos',
    title: 'Prazos e Investimento',
    emoji: '⏱️',
    icon: <Clock className="w-5 h-5" />,
    color: 'from-amber-500 to-yellow-500',
    questions: [
      {
        id: 'prazo',
        type: 'text',
        question: 'Para quando vocês precisam da primeira versão do sistema funcionando?',
        placeholder: 'Ex: Em 2 meses, início do próximo ano...'
      },
      {
        id: 'investimento',
        type: 'text',
        question: 'Vocês têm um valor aproximado previsto para investir nessa primeira etapa?',
        placeholder: 'Ex: Entre R$ 5.000 e R$ 10.000...'
      },
      {
        id: 'usuarios_simultaneos',
        type: 'text',
        question: 'Quantas pessoas usando o sistema ao mesmo tempo no mesmo horário?',
        helperText: 'Ex: Geralmente são 5 pessoas usando ao mesmo tempo, ou bem mais que isso?',
        placeholder: 'Ex: 5 pessoas ao mesmo tempo...'
      }
    ]
  },
  {
    id: 'prioridades',
    title: 'Prioridades',
    emoji: '🚀',
    icon: <Target className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    questions: [
      {
        id: 'prioridades_30_dias',
        type: 'textarea',
        question: 'Se tivéssemos que entregar uma versão básica funcionando em 30 dias, quais são as 3 coisas que NÃO PODEM FALTAR de jeito nenhum?',
        helperText: 'Ex: 1. Agendamento, 2. Prontuário digital, 3. Controle financeiro.',
        placeholder: 'Liste as 3 prioridades essenciais...'
      }
    ]
  }
]

// Flatten questions for navigation
const allQuestions = sections.flatMap(section => 
  section.questions.map(q => ({ ...q, sectionId: section.id, sectionTitle: section.title, sectionEmoji: section.emoji }))
)

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const currentQuestion = allQuestions[currentStep]
  const currentSection = sections.find(s => s.id === currentQuestion.sectionId)!
  const totalQuestions = allQuestions.length
  const progress = ((currentStep + 1) / totalQuestions) * 100
  
  // Calculate section progress
  const getSectionProgress = (sectionId: string) => {
    const sectionQuestions = sections.find(s => s.id === sectionId)!.questions
    const answered = sectionQuestions.filter(q => answers[q.id] && answers[q.id].trim() !== '').length
    return (answered / sectionQuestions.length) * 100
  }

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const canProceed = useCallback(() => {
    const answer = answers[currentQuestion.id]
    return answer && answer.trim() !== ''
  }, [answers, currentQuestion])

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleGoBack = () => {
    setIsComplete(false)
  }

  // Generate WhatsApp message with answers
  const generateWhatsAppMessage = () => {
    const lines: string[] = ['📋 *QUESTIONÁRIO - GESTÃO DA CLÍNICA DE REABILITAÇÃO*']
    lines.push('')
    
    let questionNumber = 0
    sections.forEach(section => {
      lines.push(`${section.emoji} *${section.title.toUpperCase()}*`)
      section.questions.forEach((q) => {
        questionNumber++
        const answer = answers[q.id] || 'Não informado'
        lines.push(`*${questionNumber}.* ${q.question}`)
        lines.push(`_R: ${answer}_`)
        lines.push('')
      })
    })
    
    lines.push('---')
    lines.push('Enviado via Formulário Digital Rob Dev')
    
    return encodeURIComponent(lines.join('\n'))
  }

  const handleSendWhatsApp = () => {
    const phoneNumber = '5519987722236'
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      let questionNumber = 0
      const formattedAnswers = sections.flatMap(section =>
        section.questions.map(q => {
          questionNumber++
          return {
            section: `${section.emoji} ${section.title}`,
            question: q.question,
            answer: answers[q.id] || 'Não informado',
            number: questionNumber
          }
        })
      )

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: formattedAnswers })
      })

      if (!response.ok) throw new Error('Erro ao gerar PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = 'questionario-reabilitacao.pdf'
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const renderInput = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={currentQuestion.placeholder}
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full h-14 text-lg border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-blue-600 focus:ring-0 transition-colors"
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            placeholder={currentQuestion.placeholder}
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full min-h-40 text-lg border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-blue-600 focus:ring-0 transition-colors resize-none"
          />
        )
      
      default:
        return null
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Brand Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Rob Dev</h1>
                <p className="text-xs text-gray-500">Desenvolvedor</p>
              </div>
            </div>
            <a 
              href="https://www.linkedin.com/in/robsilva1/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-medium text-gray-900 mb-2">Questionário Concluído!</h1>
                <p className="text-gray-500">Obrigado por suas respostas. Agora você pode baixar o documento.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8 max-h-80 overflow-y-auto">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Resumo das Respostas
                </h2>
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <span>{section.emoji}</span>
                        {section.title}
                      </h3>
                      <div className="space-y-3 pl-2">
                        {section.questions.map((q) => (
                          <div key={q.id} className="border-l-2 border-blue-200 pl-3">
                            <p className="text-sm text-gray-500 mb-1">{q.question}</p>
                            <p className="text-gray-900 text-sm">
                              {answers[q.id] || <span className="text-gray-400 italic">Não informado</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Button - Primary Option */}
              <Button
                onClick={handleSendWhatsApp}
                className="w-full h-14 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar por WhatsApp
              </Button>

              {/* PDF Download - Secondary Option */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-center text-sm text-gray-500 mb-3">
                  Ou baixe o questionário em PDF
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="flex-1 h-12 text-base"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex-1 h-12 text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? 'Gerando...' : 'Baixar PDF'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
        
        <footer className="py-4 text-center text-sm text-gray-400 border-t bg-white">
          <div className="flex items-center justify-center gap-4">
            <span>Desenvolvido por</span>
            <a 
              href="https://www.linkedin.com/in/robsilva1/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Rob Silva</span>
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Brand Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Rob Dev</h1>
              <p className="text-xs text-gray-500">Desenvolvedor</p>
            </div>
          </div>
          <a 
            href="https://www.linkedin.com/in/robsilva1/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span className="hidden sm:inline">LinkedIn</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Question Header */}
      <div className="bg-white border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{currentSection.emoji}</span>
            <div>
              <h2 className="text-sm font-medium text-gray-900">{currentSection.title}</h2>
              <p className="text-xs text-gray-500">Parte {sections.findIndex(s => s.id === currentSection.id) + 1} de {sections.length}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <Progress value={progress} className="h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-violet-600 flex-1" />
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              {currentStep + 1}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Section Progress Indicators */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((section, index) => {
              const sectionProgress = getSectionProgress(section.id)
              const isCurrentSection = section.id === currentSection.id
              const sectionStartIndex = sections.slice(0, index).reduce((acc, s) => acc + s.questions.length, 0)
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentStep(sectionStartIndex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                    ${isCurrentSection 
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30' 
                      : sectionProgress === 100
                        ? 'bg-blue-100 text-blue-700'
                        : sectionProgress > 0
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  <span>{section.emoji}</span>
                  <span className="hidden sm:inline">{section.title}</span>
                  {sectionProgress === 100 && !isCurrentSection && (
                    <Check className="w-3 h-3" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8"
            >
              {/* Question Number */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 text-sm font-medium">
                  {currentStep + 1}
                </span>
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed mb-3">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.helperText && (
                  <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
                    {currentQuestion.helperText}
                  </p>
                )}
              </div>

              {/* Input */}
              <div className="mt-6">
                {renderInput()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="h-12 px-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            {/* Step Indicators */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-xs">
              {allQuestions.slice(
                Math.max(0, currentStep - 4),
                Math.min(totalQuestions, currentStep + 5)
              ).map((_, index) => {
                const actualIndex = Math.max(0, currentStep - 4) + index
                return (
                  <button
                    key={actualIndex}
                    onClick={() => setCurrentStep(actualIndex)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      actualIndex === currentStep
                        ? 'w-4 bg-gradient-to-r from-blue-600 to-violet-600'
                        : answers[allQuestions[actualIndex].id]
                          ? 'bg-blue-400'
                          : 'bg-gray-200'
                    }`}
                  />
                )
              })}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
            >
              {currentStep === totalQuestions - 1 ? (
                <>
                  Concluir
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
