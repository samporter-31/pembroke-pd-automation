'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [agenda, setAgenda] = useState('')
  const [title, setTitle] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('pdf')
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const router = useRouter()

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000) // Auto-hide after 5 seconds
  }

  const handlePdfUpload = async (file: File) => {
    setPdfLoading(true)
    setFileName(file.name)
    setNotification(null) // Clear any existing notifications
    
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
    
    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda, title })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('Navigating to:', `/session/${data.agendaId}`)
        router.push(`/session/${data.agendaId}`)
      } else {
        setFormLoading(false)
        showNotification('error', 'Error generating form: ' + data.error)
      }
    } catch (error) {
      setFormLoading(false)
      console.error('Submit error:', error)
      showNotification('error', 'Error: ' + String(error))
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Notification Banner */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success'
                      ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                      : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Professional Learning Reports
          </h1>
          <p className="text-gray-600 mb-8">
            Upload your PD agenda and create intelligent learning reports
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mathematics Pedagogy Workshop"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Upload Method Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to provide the agenda?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('pdf')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    uploadMethod === 'pdf'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📄 Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('text')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    uploadMethod === 'text'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✏️ Type Text
                </button>
              </div>
            </div>

            {/* PDF Drag & Drop Area */}
            {uploadMethod === 'pdf' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF Agenda
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : agenda
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {pdfLoading ? (
                    <div className="text-blue-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Processing PDF...
                    </div>
                  ) : agenda ? (
                    <div className="text-green-600">
                      <div className="text-2xl mb-2">✅</div>
                      <p className="font-medium">PDF Processed Successfully!</p>
                      <p className="text-sm text-gray-600">{fileName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {agenda.length} characters extracted
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-lg font-medium mb-2">
                        Drag & drop your PDF agenda here
                      </p>
                      <p className="text-sm mb-4">or</p>
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
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                      >
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Development Agenda
                </label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Paste your PD session agenda here..."
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {/* Extracted text preview for PDF uploads */}
            {uploadMethod === 'pdf' && agenda && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted Text (you can edit if needed)
                </label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={formLoading || pdfLoading || !agenda.trim() || !title.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formLoading ? 'Creating personalised questions...' : 'Generate Note-Taking Form →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}