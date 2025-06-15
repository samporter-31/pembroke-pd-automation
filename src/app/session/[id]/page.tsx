'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle, BookOpen, Brain, Target, School, Lightbulb, X, FileText, Send, ArrowLeft, MessageSquare } from 'lucide-react'

interface SessionData {
  id: string
  participant_name: string
  agendas: {
    title: string
    content: string
  }
  form_structure: {
    focus_questions: string[]
  }
}

interface FrameworkOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  bgColor: string
  borderColor: string
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null)
  
  // Form state
  const [notes, setNotes] = useState('')
  const [selectedFrameworks, setSelectedFrameworks] = useState<Record<string, boolean>>({
    aitsl: true,
    qtm: true,
    visible_thinking: true,
    modern_classrooms: false,
    pembroke: true
  })

  // Framework options configuration
  const frameworkOptions: FrameworkOption[] = [
    {
      id: 'aitsl',
      name: 'AITSL Standards',
      description: 'Professional Standards for Teachers',
      icon: <Target className="w-5 h-5" />,
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-600'
    },
    {
      id: 'qtm',
      name: 'Quality Teaching',
      description: 'Three dimensions of quality',
      icon: <BookOpen className="w-5 h-5" />,
      bgColor: 'bg-green-100',
      borderColor: 'border-green-600'
    },
    {
      id: 'visible_thinking',
      name: 'Visible Thinking',
      description: 'Harvard thinking routines',
      icon: <Brain className="w-5 h-5" />,
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-600'
    },
    {
      id: 'modern_classrooms',
      name: 'Modern Classrooms',
      description: 'Self-paced learning',
      icon: <Lightbulb className="w-5 h-5" />,
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-600'
    },
    {
      id: 'pembroke',
      name: 'Pembroke Pedagogies',
      description: 'School methodologies',
      icon: <School className="w-5 h-5" />,
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-600'
    }
  ]

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    if (params.id) {
      fetchSession()
    }
  }, [params.id])

  const fetchSession = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/get-session/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load session')
      }
      
      const data = await response.json()
      setSessionData(data.session)
      
    } catch (error) {
      console.error('Error fetching session:', error)
      setError(error instanceof Error ? error.message : 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const handleFrameworkChange = (frameworkId: string) => {
    setSelectedFrameworks(prev => ({
      ...prev,
      [frameworkId]: !prev[frameworkId]
    }))
  }

  const handleSubmit = async () => {
    if (!notes.trim()) {
      showNotification('warning', 'Please add some notes before submitting')
      return
    }
    
    const hasSelectedFramework = Object.values(selectedFrameworks).some(selected => selected)
    if (!hasSelectedFramework) {
      showNotification('error', 'Please select at least one framework')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      const submitData = {
        session_id: params.id,
        general_notes: notes,
        responses: {},
        selected_frameworks: selectedFrameworks
      }
      
      const response = await fetch('/api/submit-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save notes')
      }
      
      showNotification('success', 'Notes saved! Generating your report...')
      
      setTimeout(() => {
        router.push(`/report/${params.id}`)
      }, 2000)
      
    } catch (error) {
      console.error('Submission error:', error)
      showNotification('error', 'Failed to save notes')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Session</h2>
          <p className="text-gray-600">Preparing your note-taking space...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!sessionData) return null

  const selectedFrameworksCount = Object.values(selectedFrameworks).filter(Boolean).length
  const notesWordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              Professional Learning Session
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {sessionData.agendas.title}
          </h2>
          <p className="text-gray-600">
            Participant: {sessionData.participant_name}
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
          <div className={`p-4 rounded-xl shadow-lg flex items-start ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex-1">{notification.message}</div>
            <button onClick={() => setNotification(null)} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Focus Questions Card */}
            <div className="bg-purple-100 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center mb-4">
                <div className="icon-circle mr-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Focus Questions</h3>
              </div>
              
              <div className="space-y-3">
                {sessionData.form_structure?.focus_questions?.map((question, index) => (
                  <div key={index} className="bg-white rounded-xl p-4">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <p className="text-gray-700">{question}</p>
                    </div>
                  </div>
                )) || (
                  <>
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                        <p className="text-gray-700">What key concepts or strategies from this session resonated most with you?</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                        <p className="text-gray-700">How might you adapt these ideas for your specific teaching context?</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                        <p className="text-gray-700">What challenges do you anticipate and how will you address them?</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notes Input */}
            <div className="bg-white rounded-2xl shadow-sm p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="icon-circle mr-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Notes</h3>
                </div>
                <span className="text-sm text-gray-500">{notesWordCount} words</span>
              </div>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes here... Consider the focus questions above as prompts for your reflection. What did you learn? How will you apply it? What questions do you still have?"
                className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
              
              <div className="mt-3 text-sm text-gray-500">
                💡 Tip: Be specific about implementation ideas
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Framework Selection */}
            <div className="bg-teal-100 rounded-2xl p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Frameworks</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose frameworks to map your learning
              </p>
              
              <div className="space-y-3">
                {frameworkOptions.map((framework) => (
                  <button
                    key={framework.id}
                    onClick={() => handleFrameworkChange(framework.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedFrameworks[framework.id]
                        ? `${framework.bgColor} ${framework.borderColor}`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-6 h-6 mr-3 mt-0.5">
                        {selectedFrameworks[framework.id] ? (
                          <CheckCircle className="w-6 h-6 text-current" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          {framework.icon}
                          <span className="font-semibold text-sm ml-2">{framework.name}</span>
                        </div>
                        <p className="text-xs mt-1 text-gray-600">{framework.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-xl text-center">
                <p className="text-sm font-medium text-gray-700">
                  {selectedFrameworksCount} framework{selectedFrameworksCount !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !notes.trim() || selectedFrameworksCount === 0}
              className="w-full btn-primary py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
              style={{animationDelay: '0.3s'}}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-3" />
                  Generate Report
                </>
              )}
            </button>
            
            {(!notes.trim() || selectedFrameworksCount === 0) && (
              <p className="text-center text-sm text-gray-500">
                {!notes.trim() ? 'Add notes to continue' : 'Select at least one framework'}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}