'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, FileText, Download, Home, Target, BookOpen, Brain, School, Lightbulb, CheckCircle, TrendingUp, X, ArrowLeft, Share2, Star } from 'lucide-react'

// Type definitions
interface AITSLStandard {
  standard: string
  evidence: string
  growth_demonstrated: string
  implementation_opportunities: string
}

interface FrameworkAnalysis {
  aitsl_analysis: {
    standards_addressed: AITSLStandard[]
    overall_compliance: string
  }
  quality_teaching: {
    intellectual_quality: string
    learning_environment: string
    significance: string
  }
  visible_thinking: {
    routines_identified: string[]
    implementation_strategies: string
  }
  pembroke_pedagogies: {
    alignment: string
    integration_opportunities: string
  }
  modern_classrooms?: {
    alignment: string
    integration_opportunities: string
  }
  key_insights: string[]
  recommendations: string[]
}

interface ReportData {
  session: {
    id: string
    participant_name: string
    created_at: string
    notes: any
  }
  agenda: {
    title: string
    content: string
  }
  report: {
    id: string
    framework_analysis: FrameworkAnalysis
  }
  analysis: FrameworkAnalysis
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    if (params.id) {
      fetchReport()
    }
  }, [params.id])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/get-report/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Report not found')
      }
      
      const data = await response.json()
      setReportData(data)
      
    } catch (error) {
      console.error('Error fetching report:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    showNotification('info', 'Export feature coming soon!')
  }

  const handleShare = async () => {
    showNotification('info', 'Share feature coming soon!')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Report</h2>
          <p className="text-gray-600">Analyzing your professional learning...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary inline-flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Create New Session
          </button>
        </div>
      </div>
    )
  }

  const { session, agenda, analysis } = reportData

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <FileText className="w-4 h-4" />, available: true },
    { id: 'aitsl', name: 'AITSL', icon: <Target className="w-4 h-4" />, available: !!analysis.aitsl_analysis },
    { id: 'quality', name: 'Quality Teaching', icon: <BookOpen className="w-4 h-4" />, available: !!analysis.quality_teaching },
    { id: 'thinking', name: 'Visible Thinking', icon: <Brain className="w-4 h-4" />, available: !!analysis.visible_thinking },
    { id: 'pembroke', name: 'Pembroke', icon: <School className="w-4 h-4" />, available: !!analysis.pembroke_pedagogies },
    { id: 'modern', name: 'Modern', icon: <Lightbulb className="w-4 h-4" />, available: !!analysis.modern_classrooms },
    { id: 'insights', name: 'Insights', icon: <TrendingUp className="w-4 h-4" />, available: true }
  ]

  const availableTabs = tabs.filter(tab => tab.available)

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
              Professional Learning Report
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full mb-4">
            <CheckCircle className="w-4 h-4 mr-2" />
            Analysis Complete
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {agenda.title}
          </h2>
          <div className="text-gray-600 text-sm space-y-1">
            <p>{session.participant_name} • {new Date(session.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
          <div className={`p-4 rounded-xl shadow-lg flex items-start ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
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
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 rounded-2xl p-4 text-center animate-slide-up">
            <div className="text-2xl font-bold text-blue-900">{analysis.key_insights?.length || 0}</div>
            <div className="text-sm text-blue-700">Key Insights</div>
          </div>
          <div className="bg-green-100 rounded-2xl p-4 text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="text-2xl font-bold text-green-900">{analysis.recommendations?.length || 0}</div>
            <div className="text-sm text-green-700">Actions</div>
          </div>
          <div className="bg-purple-100 rounded-2xl p-4 text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="text-2xl font-bold text-purple-900">{availableTabs.length - 2}</div>
            <div className="text-sm text-purple-700">Frameworks</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Executive Summary</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Frameworks Analyzed</h3>
                  <div className="space-y-2">
                    {availableTabs.filter(tab => tab.id !== 'overview' && tab.id !== 'insights').map((tab) => (
                      <div key={tab.id} className="flex items-center text-purple-800">
                        <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                        {tab.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Learning Outcomes</h3>
                  <div className="space-y-2 text-green-800">
                    <div>✓ Professional standards aligned</div>
                    <div>✓ Growth opportunities identified</div>
                    <div>✓ Implementation strategies provided</div>
                    <div>✓ Next steps recommended</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AITSL Standards Tab */}
          {activeTab === 'aitsl' && analysis.aitsl_analysis && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">AITSL Standards Analysis</h2>
              </div>
              
              {analysis.aitsl_analysis.overall_compliance && (
                <div className="bg-green-100 rounded-xl p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Overall Assessment</h3>
                  <p className="text-green-800">{analysis.aitsl_analysis.overall_compliance}</p>
                </div>
              )}

              <div className="space-y-4">
                {analysis.aitsl_analysis.standards_addressed?.map((standard, index) => (
                  <div key={index} className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      {standard.standard}
                    </h3>
                    <div className="grid gap-3">
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-1">Evidence</h4>
                        <p className="text-sm text-gray-700">{standard.evidence}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-1">Growth Demonstrated</h4>
                        <p className="text-sm text-gray-700">{standard.growth_demonstrated}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-1">Implementation</h4>
                        <p className="text-sm text-gray-700">{standard.implementation_opportunities}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Teaching Tab */}
          {activeTab === 'quality' && analysis.quality_teaching && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <BookOpen className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Quality Teaching Model</h2>
              </div>
              
              <div className="grid gap-4">
                <div className="bg-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Intellectual Quality</h3>
                  <p className="text-gray-700">{analysis.quality_teaching.intellectual_quality}</p>
                </div>
                <div className="bg-teal-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-teal-900 mb-3">Learning Environment</h3>
                  <p className="text-gray-700">{analysis.quality_teaching.learning_environment}</p>
                </div>
                <div className="bg-yellow-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Significance</h3>
                  <p className="text-gray-700">{analysis.quality_teaching.significance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Visible Thinking Tab */}
          {activeTab === 'thinking' && analysis.visible_thinking && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Visible Thinking Routines</h2>
              </div>
              
              <div className="bg-purple-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Routines Identified</h3>
                {analysis.visible_thinking.routines_identified?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.visible_thinking.routines_identified.map((routine, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                        {routine}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No routines identified</p>
                )}
              </div>
              
              <div className="bg-white border border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Strategies</h3>
                <p className="text-gray-700">{analysis.visible_thinking.implementation_strategies}</p>
              </div>
            </div>
          )}

          {/* Pembroke Tab */}
          {activeTab === 'pembroke' && analysis.pembroke_pedagogies && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <School className="w-8 h-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Pembroke Pedagogies</h2>
              </div>
              
              <div className="bg-indigo-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Alignment</h3>
                <p className="text-gray-700">{analysis.pembroke_pedagogies.alignment}</p>
              </div>
              
              <div className="bg-white border border-indigo-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Opportunities</h3>
                <p className="text-gray-700">{analysis.pembroke_pedagogies.integration_opportunities}</p>
              </div>
            </div>
          )}

          {/* Modern Classrooms Tab */}
          {activeTab === 'modern' && analysis.modern_classrooms && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900">Modern Classrooms</h2>
              </div>
              
              <div className="bg-yellow-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Alignment</h3>
                <p className="text-gray-700">{analysis.modern_classrooms.alignment}</p>
              </div>
              
              <div className="bg-white border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Opportunities</h3>
                <p className="text-gray-700">{analysis.modern_classrooms.integration_opportunities}</p>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Key Insights & Actions</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-orange-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Key Insights
                  </h3>
                  {analysis.key_insights?.length > 0 ? (
                    <ul className="space-y-3">
                      {analysis.key_insights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No insights available</p>
                  )}
                </div>
                
                <div className="bg-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Recommended Actions
                  </h3>
                  {analysis.recommendations?.length > 0 ? (
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No recommendations available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-8 text-center animate-slide-up" style={{animationDelay: '0.5s'}}>
          <button
            onClick={() => router.push('/')}
            className="btn-primary inline-flex items-center"
          >
            <Home className="w-5 h-5 mr-3" />
            Create Another Session
          </button>
        </div>
      </div>
    </main>
  )
}