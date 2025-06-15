'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Edit3, Brain, Target, BookOpen, School, Lightbulb, CheckCircle, AlertCircle, X, User, ArrowRight, Sparkles } from 'lucide-react'

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
  const router = useRouter()

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handlePdfUpload = async (file: File) => {
    setPdfLoading(true)
    setFileName(file.name)
    setNotification(null)
    
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setAgenda(data.text)
        showNotification('success', `PDF processed successfully!`)
      } else {
        showNotification('error', 'Error processing PDF: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showNotification('error', 'Error uploading PDF')
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

  const handleSubmit = async () => {
    if (!agenda.trim() || !title.trim() || !participantName.trim()) {
      showNotification('warning', 'Please fill in all fields')
      return
    }
    
    setFormLoading(true)
    setNotification(null)
    
    try {
      // Generate form
      const formResponse = await fetch('/api/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda, title })
      })
      
      const formData = await formResponse.json()
      
      if (!formData.success) {
        throw new Error('Error generating form')
      }

      // Create session
      const sessionResponse = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agenda_id: formData.agendaId,
          participant_name: participantName 
        })
      })
      
      const sessionData = await sessionResponse.json()
      
      if (!sessionData.success) {
        throw new Error('Error creating session')
      }

      showNotification('success', 'Session created! Redirecting...')
      
      setTimeout(() => {
        router.push(`/session/${sessionData.session_id}`)
      }, 1000)
      
    } catch (error) {
      setFormLoading(false)
      showNotification('error', 'Error: ' + String(error))
    }
  }

  const isFormValid = agenda.trim() && title.trim() && participantName.trim()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            AI Professional Learning Reports
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Transform your professional development sessions into structured learning reports mapped to educational frameworks.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-900">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Agenda</h3>
              <p className="text-sm text-gray-600">Upload your PD session agenda or paste its content.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-900">2</span>
              </div>
              <h3 className="font-semibold mb-2">Take Notes</h3>
              <p className="text-sm text-gray-600">AI generates custom questions based on your agenda.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-900">3</span>
              </div>
              <h3 className="font-semibold mb-2">Select Frameworks</h3>
              <p className="text-sm text-gray-600">Map your learning to educational frameworks.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-900">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Report</h3>
              <p className="text-sm text-gray-600">Receive your detailed analysis and evidence of learning.</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Session Setup Progress</span>
              <span>{isFormValid ? '100%' : participantName && title ? '66%' : participantName ? '33%' : '0%'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: isFormValid ? '100%' : participantName && title ? '66%' : participantName ? '33%' : '0%' }}
              />
            </div>
          </div>
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

      {/* Main Form */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Create Your Professional Learning Session</h2>
            
            <div className="space-y-8">
              {/* Your Details */}
              <div>
                <h3 className="text-lg font-bold mb-4">Your Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Mathematics Pedagogy Workshop"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Provide Agenda Content */}
              <div>
                <h3 className="text-lg font-bold mb-4">Provide Agenda Content</h3>
                
                {/* Upload Method Toggle */}
                <div className="flex gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('pdf')}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
                      uploadMethod === 'pdf'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('text')}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
                      uploadMethod === 'text'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Type Text
                  </button>
                </div>

                {/* PDF Upload */}
                {uploadMethod === 'pdf' && (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : agenda
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
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
                      </div>
                    ) : agenda ? (
                      <div className="text-green-600">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                        <p className="font-medium text-lg">PDF Processed!</p>
                        <p className="text-sm text-gray-600 mt-1">{fileName}</p>
                      </div>
                    ) : (
                      <div>
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Choose PDF File
                        </p>
                        <p className="text-sm text-gray-500 mb-4">or drag and drop</p>
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
                          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 font-medium"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Text Input */}
                {uploadMethod === 'text' && (
                  <div>
                    <textarea
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      placeholder="Paste your PD session agenda here..."
                      rows={8}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              {isFormValid && (
                <div className="pt-4 text-center animate-fade-in">
                  <button
                    onClick={handleSubmit}
                    disabled={formLoading}
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Creating Session...
                      </>
                    ) : (
                      <>
                        Start Learning Journey
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}