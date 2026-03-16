'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Download, 
  Code2, 
  Linkedin, 
  ExternalLink,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Question {
  id: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox'
  question: string
  helperText?: string
  options?: { value: string }[]
  required?: boolean
  sectionId?: string
  sectionTitle?: string
  sectionEmoji?: string
}

interface Section {
  id: string
  title: string
  description: string
  emoji: string
  questions: Question[]
}

export function DynamicForm({ title, sections }: { title: string, sections: Section[] }) {
  const allQuestions = sections.flatMap(section => 
    section.questions.map(q => ({ ...q, sectionId: section.id, sectionTitle: section.title, sectionEmoji: section.emoji }))
  )

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const currentQuestion = allQuestions[currentStep] || null
  const currentSection = sections.find(s => s.id === currentQuestion?.sectionId) || null
  const totalQuestions = allQuestions.length
  const progress = totalQuestions > 0 ? ((currentStep + 1) / totalQuestions) * 100 : 0

  // Calculate section progress
  const getSectionProgress = (sectionId: string) => {
    const sectionQuestions = sections.find(s => s.id === sectionId)?.questions || []
    if (sectionQuestions.length === 0) return 0
    const answered = sectionQuestions.filter(q => {
        const val = answers[q.id]
        if (Array.isArray(val)) return val.length > 0
        return val !== undefined && String(val).trim() !== ''
    }).length
    return (answered / sectionQuestions.length) * 100
  }

  const handleAnswerChange = (value: any) => {
    if (!currentQuestion) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (!currentQuestion) return
    setAnswers(prev => {
      const current = prev[currentQuestion.id] || []
      if (checked) return { ...prev, [currentQuestion.id]: [...current, optionValue] }
      return { ...prev, [currentQuestion.id]: current.filter((v: string) => v !== optionValue) }
    })
  }

  const canProceed = useCallback(() => {
    if (!currentQuestion) return false
    const answer = answers[currentQuestion.id]

    if (Array.isArray(answer) && answer.some(a => a.toLowerCase().startsWith('outro')) && !answers[`${currentQuestion.id}_outro_text`]?.trim()) return false
    if (typeof answer === 'string' && answer.toLowerCase().startsWith('outro') && !answers[`${currentQuestion.id}_outro_text`]?.trim()) return false

    if (!currentQuestion.required) return true
    
    if (Array.isArray(answer)) return answer.length > 0
    return answer && String(answer).trim() !== ''
  }, [answers, currentQuestion])

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const handleGoBack = () => {
    setIsComplete(false)
  }

  const generateWhatsAppMessage = () => {
    const lines: string[] = [`📋 *${title.toUpperCase()}*`, '']
    let qNum = 0
    sections.forEach(section => {
      lines.push(`${section.emoji} *${section.title.toUpperCase()}*`)
      section.questions.forEach((q) => {
        qNum++
        let answer = answers[q.id] || 'Não informado'
        if (Array.isArray(answer)) {
          answer = answer.map((a: string) => a.toLowerCase().startsWith('outro') && answers[`${q.id}_outro_text`] ? `${a} (${answers[`${q.id}_outro_text`]})` : a).join(', ')
        } else if (typeof answer === 'string' && answer.toLowerCase().startsWith('outro') && answers[`${q.id}_outro_text`]) {
          answer = `${answer} (${answers[`${q.id}_outro_text`]})`
        }
        lines.push(`*${qNum}.* ${q.question}`)
        lines.push(`_R: ${answer}_`)
        lines.push('')
      })
    })
    lines.push('---')
    lines.push('Enviado via Formulário Dinâmico')
    return encodeURIComponent(lines.join('\n'))
  }

  const handleSendWhatsApp = () => {
    const phoneNumber = '5519987722236'
    const msg = generateWhatsAppMessage()
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank')
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      let questionNumber = 0
      const formattedAnswers = sections.flatMap(section =>
        section.questions.map(q => {
          questionNumber++
          let answer = answers[q.id] || 'Não informado'
          if (Array.isArray(answer)) {
            answer = answer.map((a: string) => a.toLowerCase().startsWith('outro') && answers[`${q.id}_outro_text`] ? `${a} (${answers[`${q.id}_outro_text`]})` : a).join(', ')
          } else if (typeof answer === 'string' && answer.toLowerCase().startsWith('outro') && answers[`${q.id}_outro_text`]) {
            answer = `${answer} (${answers[`${q.id}_outro_text`]})`
          }
          return {
            section: `${section.emoji} ${section.title}`,
            question: q.question,
            answer: answer,
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

      const arrayBuffer = await response.arrayBuffer()
      const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'formulario-resposta.pdf'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Erro:', error)
      alert("Ocorreu um erro ao gerar o PDF. Verifique se a API está configurada adequadamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const renderInput = () => {
    if (!currentQuestion) return null
    switch (currentQuestion.type) {
      case 'text':
        return (
          <Textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full min-h-20 text-lg border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-blue-600 focus:ring-0 transition-colors resize-none"
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full min-h-40 text-lg border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-blue-600 focus:ring-0 transition-colors resize-none"
          />
        )
      case 'radio':
        return (
          <RadioGroup value={answers[currentQuestion.id]} onValueChange={handleAnswerChange} className="space-y-3 mt-6 text-left">
            {currentQuestion.options?.map((opt, i) => (
              <div key={i}>
                <label 
                   className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      answers[currentQuestion.id] === opt.value 
                        ? "border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-500/10" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                   }`}
                >
                  <RadioGroupItem value={opt.value} id={`r-${i}`} className={answers[currentQuestion.id] === opt.value ? "text-blue-600 border-blue-600" : ""} />
                  <span className="text-base text-gray-700 flex-1">{opt.value}</span>
                </label>
                <AnimatePresence>
                  {opt.value.toLowerCase().startsWith('outro') && answers[currentQuestion.id] === opt.value && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 pl-4 pr-1">
                      <Textarea
                        placeholder="Por favor, especifique:"
                        value={answers[`${currentQuestion.id}_outro_text`] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [`${currentQuestion.id}_outro_text`]: e.target.value }))}
                        className="w-full min-h-16 text-sm border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-blue-600 focus:ring-0 resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </RadioGroup>
        )
      case 'checkbox':
        const checkedValues = answers[currentQuestion.id] || []
        return (
          <div className="space-y-3 mt-6 text-left">
            {currentQuestion.options?.map((opt, i) => {
              const checked = checkedValues.includes(opt.value)
              return (
                <div key={i}>
                  <label 
                     className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                       checked 
                         ? "border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-500/10" 
                         : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                     }`}
                  >
                    <Checkbox 
                      id={`c-${i}`} 
                      checked={checked}
                      onCheckedChange={(c) => handleCheckboxChange(opt.value, !!c)}
                      className={checked ? "data-[state=checked]:bg-blue-600 data-[state=checked]:text-white border-blue-600" : ""}
                    />
                    <span className="text-base text-gray-700 flex-1">{opt.value}</span>
                  </label>
                  <AnimatePresence>
                    {opt.value.toLowerCase().startsWith('outro') && checked && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 pl-4 pr-1">
                        <Textarea
                          placeholder="Por favor, especifique:"
                          value={answers[`${currentQuestion.id}_outro_text`] || ''}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [`${currentQuestion.id}_outro_text`]: e.target.value }))}
                          className="w-full min-h-16 text-sm border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-blue-600 focus:ring-0 resize-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )
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
                <div className="space-y-6 text-left">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <span>{section.emoji}</span>
                        {section.title}
                      </h3>
                      <div className="space-y-3 pl-2">
                        {section.questions.map((q) => {
                          let val = answers[q.id];
                          if (Array.isArray(val)) {
                            val = val.map((a: string) => a.toLowerCase().startsWith('outro') && answers[`${q.id}_outro_text`] ? `${a} (${answers[`${q.id}_outro_text`]})` : a);
                          } else if (typeof val === 'string' && val.toLowerCase().startsWith('outro') && answers[`${q.id}_outro_text`]) {
                            val = `${val} (${answers[`${q.id}_outro_text`]})`;
                          }
                          const answerDisplay = Array.isArray(val) ? val.join(', ') : val;
                          return (
                          <div key={q.id} className="border-l-2 border-blue-200 pl-3">
                            <p className="text-sm text-gray-500 mb-1">{q.question}</p>
                            <p className="text-gray-900 text-sm">
                              {answerDisplay || <span className="text-gray-400 italic">Não informado</span>}
                            </p>
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Button - Primary Option */}
              <Button
                onClick={handleSendWhatsApp}
                className="w-full h-14 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 text-white border-0"
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
              <p className="text-xs text-gray-500">{title}</p>
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
          {currentSection && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{currentSection.emoji}</span>
            <div>
              <h2 className="text-sm font-medium text-gray-900">{currentSection.title}</h2>
              <p className="text-xs text-gray-500">Parte {sections.findIndex(s => s.id === currentSection.id) + 1} de {sections.length}</p>
            </div>
          </div>
          )}
          
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
              const isCurrentSection = section.id === currentSection?.id
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
              {!currentQuestion ? (
                 <p className="p-8 text-center text-gray-500">Formulário sem perguntas.</p>
              ) : (
                <>
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
                </>
              )}
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
                const qId = allQuestions[actualIndex]?.id;
                const answered = answers[qId] && (!Array.isArray(answers[qId]) || answers[qId].length > 0);
                return (
                  <button
                    key={actualIndex}
                    onClick={() => setCurrentStep(actualIndex)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      actualIndex === currentStep
                        ? 'w-4 bg-gradient-to-r from-blue-600 to-violet-600'
                        : answered
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
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/30 text-white border-0 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
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
