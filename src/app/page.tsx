'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [agenda, setAgenda] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('pdf')
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const router = useRouter()

  const handlePdfUpload = async (file: File) => {
  setLoading(true)
  setFileName(file.name)
  
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      })

      // Better error handling
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setAgenda(data.text)
        alert(`PDF processed! Extracted ${data.text.length} characters.`)
      } else {
        alert('Error processing PDF: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading PDF: ' + error)
    } finally {
      setLoading(false)
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
          alert('Please upload a PDF file only')
        }
      }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      
      try {
        const response = await fetch('/api/generate-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agenda, title })
        })
        
        const data = await response.json()
        
        if (data.success) {
          router.push(`/session/${data.agendaId}`)
        } else {
          alert('Error generating form: ' + data.error)
        }
      } catch (error) {
        alert('Error: ' + error)
      } finally {
        setLoading(false)
      }
    }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
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
                  {loading ? (
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
              disabled={loading || !agenda.trim() || !title.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Generate Note-Taking Form →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}