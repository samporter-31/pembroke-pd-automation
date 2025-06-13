'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle, BookOpen, Brain, Target, School, Lightbulb } from 'lucide-react'

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
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  
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
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      id: 'qtm',
      name: 'Quality Teaching Model',
      description: 'Intellectual Quality, Learning Environment, Significance',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      id: 'visible_thinking',
      name: 'Visible Thinking Routines',
      description: 'Harvard Project Zero thinking strategies',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      id: 'modern_classrooms',
      name: 'Modern Classrooms Project',
      description: 'Self-paced, mastery-based learning approaches',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      id: 'pembroke',
      name: 'Pembroke Effective Pedagogies',
      description: 'School-specific teaching methodologies',
      icon: <School className="w-5 h-5" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    }
  ]

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
      setNotification('Notes saved successfully! Generating your report...')
      
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
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!sessionData) return null

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Professional Learning Session
          </h1>
          <div className="text-gray-600 mb-4">
            <p><span className="font-medium">Session:</span> {sessionData.agendas.title}</p>
            <p><span className="font-medium">Participant:</span> {sessionData.participant_name}</p>
          </div>
          
          {/* Session Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">📝 How to Use This Session</h2>
            <div className="text-blue-800 text-sm space-y-2">
              <p>• Take notes during your professional learning session</p>
              <p>• Answer the AI-generated questions based on the session content</p>
              <p>• Select which frameworks you'd like your learning mapped to</p>
              <p>• Submit to generate your personalized professional development report</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Framework Selection */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🎯 Select Analysis Frameworks
            </h2>
            <p className="text-gray-600 mb-6">
              Choose which educational frameworks you'd like your learning mapped to in the final report.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {frameworkOptions.map((framework) => (
                <label
                  key={framework.id}
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedFrameworks[framework.id]
                      ? framework.color
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFrameworks[framework.id]}
                    onChange={(e) => handleFrameworkChange(framework.id, e.target.checked)}
                    className="sr-only"
                  />
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {framework.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-sm">{framework.name}</h3>
                      {selectedFrameworks[framework.id] && (
                        <CheckCircle className="w-4 h-4 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs mt-1 opacity-80">{framework.description}</p>
                  </div>
                </label>
              ))}
            </div>
            
            {!Object.values(selectedFrameworks).some(selected => selected) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Please select at least one framework for analysis
                </p>
              </div>
            )}
          </div>

          {/* General Notes Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📋 General Notes
            </h2>
            <p className="text-gray-600 mb-4">
              Record your key takeaways, insights, and reflections from the session.
            </p>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="What were the main concepts covered? What resonated with you? How might you apply these ideas in your teaching practice?"
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* AI-Generated Questions */}
          {sessionData.form_structure?.questions?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🤖 Session-Specific Questions
              </h2>
              <p className="text-gray-600 mb-6">
                These questions were generated based on your session agenda to help capture specific learning outcomes.
              </p>
              
              <div className="space-y-6">
                {sessionData.form_structure.questions.map((question, index) => (
                  <div key={question.id} className="border-l-4 border-blue-500 pl-6">
                    <label className="block font-medium text-gray-900 mb-2">
                      {index + 1}. {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      placeholder="Share your thoughts, examples, or reflections..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      required={question.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {notification && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800">{notification}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h3 className="font-semibold text-gray-900">Ready to Generate Your Report?</h3>
                <p className="text-gray-600 text-sm">Your responses will be analyzed against the selected frameworks.</p>
              </div>
              <button
                type="submit"
                disabled={submitting || !Object.values(selectedFrameworks).some(selected => selected)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  'Generate Professional Learning Report'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}