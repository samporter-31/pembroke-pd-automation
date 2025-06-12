'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface FormField {
  id: string
  label: string
  type: string
  placeholder: string
}

interface FormSection {
  title: string
  description: string
  fields: FormField[]
}

interface FormData {
  [key: string]: string
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [agenda, setAgenda] = useState<any>(null)
  const [formStructure, setFormStructure] = useState<{ sections: FormSection[] } | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [participantName, setParticipantName] = useState('')
  const [genericNotes, setGenericNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchSessionData()
  }, [params.id])

  const fetchSessionData = async () => {
    try {
      // For now, we'll create a basic form structure
      // Later this will fetch the actual AI-generated form from the database
      const fallbackForm = {
        sections: [
          {
            title: "Key Learning Points",
            description: "Main concepts and insights from the session",
            fields: [
              {
                id: "learning_objectives",
                label: "What were the main learning objectives?",
                type: "textarea",
                placeholder: "Describe the key learning objectives..."
              },
              {
                id: "key_concepts",
                label: "What key concepts were covered?",
                type: "textarea",
                placeholder: "List the main concepts discussed..."
              }
            ]
          },
          {
            title: "Implementation Ideas",
            description: "How you'll apply this learning",
            fields: [
              {
                id: "implementation_plans",
                label: "How will you implement these ideas?",
                type: "textarea",
                placeholder: "Describe your implementation plans..."
              },
              {
                id: "action_items",
                label: "What are your immediate action items?",
                type: "textarea",
                placeholder: "List specific actions you'll take..."
              }
            ]
          },
          {
            title: "Reflection & Questions",
            description: "Your thoughts and questions",
            fields: [
              {
                id: "reflection",
                label: "What did you find most valuable about this session?",
                type: "textarea",
                placeholder: "Reflect on the most valuable aspects..."
              },
              {
                id: "questions",
                label: "What questions do you still have?",
                type: "textarea",
                placeholder: "List any remaining questions..."
              }
            ]
          }
        ]
      }
      
      setFormStructure(fallbackForm)
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!participantName.trim()) {
    setError('Please enter your name')
    return
  }

  // Check if user has entered at least some notes
  const hasAnyNotes = genericNotes.trim() || Object.values(formData).some(value => value.trim())
  
  if (!hasAnyNotes) {
    setError('Please add some notes before submitting')
    return
  }

  setSubmitting(true)
  setError(null)
  setSuccess(null)
  
  try {
    const response = await fetch('/api/submit-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agendaId: params.id,
        participantName,
        genericNotes,
        structuredResponses: formData
      })
    })

    const data = await response.json()

    if (data.success) {
      setSuccess(`Analysis complete! Your professional learning report has been generated.`)
      
      // Navigate to report page after a short delay
      setTimeout(() => {
        router.push(`/report/${data.sessionId}`)
      }, 2000)
    } else {
      setError('Error generating report: ' + data.error)
    }
    
    } catch (error) {
      setError('Error: ' + String(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Professional Learning Notes
          </h1>
          <p className="text-gray-600">
            Take notes during your professional development session
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name Input Error */}
          {error && error.includes('name') && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Participant Name */}
          <div className="border-b border-gray-200 pb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Generic Notes Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              📝 General Notes
            </h2>
            <p className="text-blue-700 mb-4">
              Capture any thoughts, ideas, or observations that don't fit the specific questions below
            </p>
            <textarea
              value={genericNotes}
              onChange={(e) => setGenericNotes(e.target.value)}
              placeholder="Write down anything that stands out to you - quotes, ideas, connections, questions, or general observations..."
              rows={6}
              className="w-full rounded-lg border border-blue-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Structured Form Sections */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Guided Reflection Questions
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                These questions are optional but will help create a more detailed learning report
              </p>
            </div>

            {formStructure?.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {section.description}
                </p>

                <div className="space-y-6">
                  {section.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes validation error */}
          {error && error.includes('notes') && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Success notification at bottom */}
          {success && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Home
            </button>
            
            <button
              type="submit"
              disabled={submitting || !participantName.trim()}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Analyzing notes with AI...' : 'Generate Learning Report →'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </main>
  )
}