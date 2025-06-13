'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle, BookOpen, Brain, Target, School, Lightbulb, X, FileText, Send, ArrowLeft } from 'lucide-react'

interface FormQuestion {
  id: string
  question: string
  type: string
  required: boolean
}

interface SessionData {
  id: string
  participant_name: string
  agendas: {
    title: string
    content: string
  }
  form_structure: {
    questions: FormQuestion[]
  }
}

interface FrameworkOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
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
  
  // Form responses
  const [generalNotes, setGeneralNotes] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})
  
  // Framework selection state
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
      description: 'Australian Professional Standards for Teachers',
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'qtm',
      name: 'Quality Teaching Model',
      description: 'Intellectual Quality, Learning Environment, Significance',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-green-700',
      bgColor: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'visible_thinking',
      name: 'Visible Thinking Routines',
      description: 'Harvard Project Zero thinking strategies',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      id: 'modern_classrooms',
      name: 'Modern Classrooms Project',
      description: 'Self-paced, mastery-based learning approaches',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      id: 'pembroke',
      name: 'Pembroke Effective Pedagogies',
      description: 'School-specific teaching methodologies',
      icon: <School className="w-5 h-5" />,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    }
  ]

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-l-green-500 text-gray-900 shadow-sm'
      case 'error':  
        return 'bg-white border-l-4 border-l-red-500 text-gray-900 shadow-sm'
      case 'info':
        return 'bg-white border-l-4 border-l-blue-500 text-gray-900 shadow-sm'
      case 'warning':
        return 'bg-white border-l-4 border-l-orange-500 text-gray-900 shadow-sm'
      default:
        return 'bg-white border-l-4 border-l-gray-500 text-gray-900 shadow-sm'
    }
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
        if (response.status === 404) {
          throw new Error('Session not found')
        }
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

  const handleFrameworkChange = (frameworkId: string, checked: boolean) => {
    setSelectedFrameworks(prev => ({
      ...prev,
      [frameworkId]: checked
    }))
  }

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      // Validate that at least one framework is selected
      const hasSelectedFramework = Object.values(selectedFrameworks).some(selected => selected)
      if (!hasSelectedFramework) {
        throw new Error('Please select at least one framework for analysis')
      }
      
      const submitData = {
        session_id: params.id,
        general_notes: generalNotes,
        responses: responses,
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save notes')
      }
      
      const result = await response.json()
      
      // Show success notification
      showNotification('success', 'Notes saved successfully! Generating your report...')
      
      // Redirect to report page after short delay
      setTimeout(() => {
        router.push(`/report/${params.id}`)
      }, 2000)
      
    } catch (error) {
      console.error('Submission error:', error)
      setError(error instanceof Error ? error.message : 'Failed to save notes')
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Session</h2>
          <p className="text-gray-600">Preparing your note-taking form...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!sessionData) return null

  const getProgressPercentage = () => {
    const totalFields = 1 + (sessionData.form_structure?.questions?.length || 0) // General notes + questions
    const completedFields = (generalNotes.trim() ? 1 : 0) + 
      Object.values(responses).filter(response => response.trim()).length
    
    return Math.round((completedFields / totalFields) * 100)
  }

  const selectedFrameworksCount = Object.values(selectedFrameworks).filter(Boolean).length

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Session
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Professional Learning Session
            </h1>
            <div className="text-lg text-blue-100 mb-6 space-y-1">
              <p><span className="font-medium">Session:</span> {sessionData.agendas.title}</p>
              <p><span className="font-medium">Participant:</span> {sessionData.participant_name}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-blue-100 mb-2">
                <span>Completion Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-blue-800/30 rounded-full h-2">
                <div 
                  className="bg-blue-300 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">📝 How to Use This Session</h2>
              <div className="text-gray-700 space-y-1 text-sm">
                <p>• Take notes during your professional learning session</p>
                <p>• Answer the AI-generated questions based on the session content</p>
                <p>• Select which frameworks you'd like your learning mapped to</p>
                <p>• Submit to generate your personalized professional development report</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${getNotificationStyle(notification.type)}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500" />}
                {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-orange-500" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Framework Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Analysis Frameworks</h2>
                <p className="text-gray-600 text-sm">Choose which educational frameworks to map your learning to</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {frameworkOptions.map((framework) => (
                <label
                  key={framework.id}
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedFrameworks[framework.id]
                      ? `${framework.bgColor} border-current`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedFrameworks[framework.id]}
                      onChange={(e) => handleFrameworkChange(framework.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className={`flex items-center ${framework.color}`}>
                      {framework.icon}
                      <span className="font-semibold text-sm ml-2">{framework.name}</span>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{framework.description}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-800">
                {selectedFrameworksCount} framework{selectedFrameworksCount !== 1 ? 's' : ''} selected
              </span>
              {selectedFrameworksCount === 0 && (
                <span className="text-sm text-orange-600 font-medium">⚠️ Select at least one framework</span>
              )}
            </div>
          </div>

          {/* General Notes Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">General Notes</h2>
                <p className="text-gray-600 text-sm">Record your key takeaways and reflections</p>
              </div>
            </div>
            
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="What were the main concepts covered? What resonated with you? How might you apply these ideas in your teaching practice?"
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors"
            />
            <div className="mt-2 text-xs text-gray-500">
              {generalNotes.length} characters • Be specific about what you learned and how you'll apply it
            </div>
          </div>

          {/* AI-Generated Questions */}
          {sessionData.form_structure?.questions?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Session-Specific Questions</h2>
                  <p className="text-gray-600 text-sm">AI-generated questions based on your agenda content</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {sessionData.form_structure.questions.map((question, index) => (
                  <div key={question.id} className="border-l-4 border-blue-500 pl-6 bg-blue-50/30 py-4 rounded-r-lg">
                    <label className="block font-medium text-gray-900 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full mr-2">
                        {index + 1}
                      </span>
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      placeholder="Share your thoughts, examples, or reflections..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors"
                      required={question.required}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {(responses[question.id] || '').length} characters
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-white border-l-4 border-l-red-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Generate Your Report</h3>
                <p className="text-gray-600 text-sm">Create your professional learning analysis</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Ready to Generate Your Report?</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Your responses will be analyzed against the {selectedFrameworksCount} selected framework{selectedFrameworksCount !== 1 ? 's' : ''}.
                  </p>
                  <div className="text-xs text-gray-600">
                    Progress: {getProgressPercentage()}% complete
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || selectedFrameworksCount === 0}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Generate Professional Learning Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}