'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Edit3, Brain, Target, BookOpen, School, Lightbulb, CheckCircle, AlertCircle, X, User } from 'lucide-react'

export default function Home() {
  const [agenda, setAgenda] = useState('')
  const [title, setTitle] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('pdf')
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

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

  const getProgressPercentage = () => {
    if (currentStep === 1) return 0
    if (currentStep === 2 && participantName.trim()) return 20
    if (currentStep === 3 && title.trim()) return 40
    if (currentStep === 4 && agenda.trim()) return 80
    if (formLoading) return 95
    return 100
  }

  const handlePdfUpload = async (file: File) => {
    setPdfLoading(true)
    setFileName(file.name)
    setNotification(null)
    setCurrentStep(4)
    
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setAgenda(data.text)
        showNotification('success', `PDF processed successfully! Extracted ${data.text.length} characters.`)
      } else {
        showNotification('error', 'Error processing PDF: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showNotification('error', 'Error uploading PDF: ' + String(error))
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        handlePdfUpload(file)
      } else {
        showNotification('error', 'Please upload a PDF file only')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setNotification(null)
    setCurrentStep(5)
    
    try {
      console.log('Starting form submission flow...')
      
      // Step 1: Generate the form/agenda
      console.log('Step 1: Generating form...')
      const formResponse = await fetch('/api/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda, title })
      })
      
      const formData = await formResponse.json()
      console.log('Form generation response:', formData)
      
      if (!formData.success) {
        throw new Error('Error generating form: ' + formData.error)
      }

      // Step 2: Create a session for this participant
      console.log('Step 2: Creating session for agenda:', formData.agendaId)
      const sessionResponse = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agenda_id: formData.agendaId,
          participant_name: participantName 
        })
      })
      
      const sessionData = await sessionResponse.json()
      console.log('Session creation response:', sessionData)
      
      if (!sessionData.success) {
        throw new Error('Error creating session: ' + sessionData.error)
      }

      // Step 3: Navigate to the session page
      console.log('Step 3: Navigating to session:', sessionData.session_id)
      showNotification('success', 'Session created successfully! Redirecting...')
      
      // Add small delay to show success message
      setTimeout(() => {
        router.push(`/session/${sessionData.session_id}`)
      }, 1000)
      
    } catch (error) {
      setFormLoading(false)
      setCurrentStep(4)
      console.error('Submit error:', error)
      showNotification('error', 'Error: ' + String(error))
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Professional Learning Reports
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your professional development sessions into structured learning reports mapped to educational frameworks
            </p>
            
            {/* Framework Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/30 text-blue-100 border border-blue-400/30">
                <Target className="w-4 h-4 mr-1" />
                AITSL Standards
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/30 text-green-100 border border-green-400/30">
                <BookOpen className="w-4 h-4 mr-1" />
                Quality Teaching
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-500/30 text-purple-100 border border-purple-400/30">
                <Brain className="w-4 h-4 mr-1" />
                Visible Thinking
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-500/30 text-orange-100 border border-orange-400/30">
                <Lightbulb className="w-4 h-4 mr-1" />
                Modern Classrooms
              </span>
            </div>
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Agenda</h3>
              <p className="text-blue-100 text-sm">Upload your PD session agenda or paste text content</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Take Notes</h3>
              <p className="text-blue-100 text-sm">AI generates custom questions based on your agenda content</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Select Frameworks</h3>
              <p className="text-blue-100 text-sm">Choose which educational frameworks to map your learning to</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Report</h3>
              <p className="text-blue-100 text-sm">Receive detailed analysis mapped to professional standards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Session Setup Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Professional Learning Session
              </h2>
              <p className="text-gray-600">
                Get started by providing your details and session agenda content
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Participant Name */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Participant Information</h3>
                </div>
                
                <div className="ml-11">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={participantName}
                      onChange={(e) => {
                        setParticipantName(e.target.value)
                        if (e.target.value.trim() && currentStep === 1) setCurrentStep(2)
                      }}
                      placeholder="e.g., Sarah Johnson"
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">This will appear on your professional learning report</p>
                </div>
              </div>

              {/* Step 2: Session Title */}
              {participantName.trim() && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Session Information</h3>
                  </div>
                  
                  <div className="ml-11">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        if (e.target.value.trim() && currentStep === 2) setCurrentStep(3)
                      }}
                      placeholder="e.g., Mathematics Pedagogy Workshop, Literacy Strategies PD"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Give your professional learning session a descriptive title</p>
                  </div>
                </div>
              )}

              {/* Step 3: Upload Method Selection */}
              {title.trim() && participantName.trim() && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Provide Agenda Content</h3>
                  </div>

                  <div className="ml-11">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How would you like to provide the agenda?
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setUploadMethod('pdf')}
                        className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
                          uploadMethod === 'pdf'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod('text')}
                        className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
                          uploadMethod === 'text'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Type Text
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Content Input */}
              {title.trim() && participantName.trim() && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      4
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {uploadMethod === 'pdf' ? 'Upload PDF Document' : 'Enter Agenda Text'}
                    </h3>
                  </div>

                  <div className="ml-11">
                    {/* PDF Upload */}
                    {uploadMethod === 'pdf' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Upload PDF Agenda
                        </label>
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                            dragActive
                              ? 'border-blue-500 bg-blue-50'
                              : agenda
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          {pdfLoading ? (
                            <div className="text-blue-600">
                              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                              <p className="font-medium">Processing PDF...</p>
                              <p className="text-sm text-gray-600 mt-1">Extracting text content</p>
                            </div>
                          ) : agenda ? (
                            <div className="text-green-600">
                              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                              <p className="font-medium text-lg">PDF Processed Successfully!</p>
                              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700">
                                <FileText className="w-4 h-4 mr-1" />
                                {fileName}
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {agenda.length.toLocaleString()} characters extracted
                              </p>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-lg font-medium mb-2">
                                Drag & drop your PDF agenda here
                              </p>
                              <p className="text-sm mb-4 text-gray-400">or</p>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handlePdfUpload(file)
                                }}
                                className="hidden"
                                id="pdf-upload"
                              />
                              <label
                                htmlFor="pdf-upload"
                                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose PDF File
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Text Input */}
                    {uploadMethod === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Professional Development Agenda
                        </label>
                        <textarea
                          value={agenda}
                          onChange={(e) => setAgenda(e.target.value)}
                          placeholder="Paste your PD session agenda here... Include topics, activities, learning objectives, and any relevant details."
                          rows={10}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">The more detail you provide, the better the AI can generate relevant questions</p>
                      </div>
                    )}

                    {/* Extracted text preview for PDF uploads */}
                    {uploadMethod === 'pdf' && agenda && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Extracted Text <span className="text-gray-500">(you can edit if needed)</span>
                        </label>
                        <textarea
                          value={agenda}
                          onChange={(e) => setAgenda(e.target.value)}
                          rows={8}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              {agenda.trim() && title.trim() && participantName.trim() && (
                <div className="bg-gray-50 -mx-8 -mb-8 px-8 py-6 mt-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Ready to create your note-taking session?</p>
                      <p>AI will generate personalized questions and create your session.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading || pdfLoading || !agenda.trim() || !title.trim() || !participantName.trim()}
                      className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      {formLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-3"></div>
                          Creating Session...
                        </>
                      ) : (
                        <>
                          Start Learning Session
                          <span className="ml-2">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}