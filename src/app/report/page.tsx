'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, FileText, Download, Home, Target, BookOpen, Brain, School, Lightbulb, CheckCircle, TrendingUp, X } from 'lucide-react'

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

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-l-green-500 text-gray-900 shadow-sm'
      case 'error':  
        return 'bg-white border-l-4 border-l-red-500 text-gray-900 shadow-sm'
      case 'info':
        return 'bg-white border-l-4 border-l-blue-500 text-gray-900 shadow-sm'
      default:
        return 'bg-white border-l-4 border-l-gray-500 text-gray-900 shadow-sm'
    }
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
      
      const response = await fetch(`/api/get-report/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Report not found')
        } else if (response.status === 500) {
          throw new Error('Server error - please try again later')
        } else {
          throw new Error('Failed to load report')
        }
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
    try {
      showNotification('info', 'Export functionality coming soon!')
    } catch (error) {
      console.error('Export error:', error)
      showNotification('error', 'Export failed')
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Report</h2>
          <p className="text-gray-600">Analyzing your professional learning...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
    { id: 'overview', name: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'aitsl', name: 'AITSL Standards', icon: <Target className="w-4 h-4" />, available: !!analysis.aitsl_analysis },
    { id: 'quality', name: 'Quality Teaching', icon: <BookOpen className="w-4 h-4" />, available: !!analysis.quality_teaching },
    { id: 'thinking', name: 'Visible Thinking', icon: <Brain className="w-4 h-4" />, available: !!analysis.visible_thinking },
    { id: 'pembroke', name: 'Pembroke Pedagogies', icon: <School className="w-4 h-4" />, available: !!analysis.pembroke_pedagogies },
    { id: 'modern', name: 'Modern Classrooms', icon: <Lightbulb className="w-4 h-4" />, available: !!analysis.modern_classrooms },
    { id: 'insights', name: 'Key Insights', icon: <TrendingUp className="w-4 h-4" /> }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              New Session
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Professional Learning Report
            </h1>
            <div className="text-lg text-blue-100 mb-6 space-y-1">
              <p><span className="font-medium">Participant:</span> {session.participant_name}</p>
              <p><span className="font-medium">Session:</span> {agenda.title}</p>
              <p><span className="font-medium">Date:</span> {new Date(session.created_at).toLocaleDateString()}</p>
            </div>
            
            {/* Report Status */}
            <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-100 rounded-full border border-green-400/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              Analysis Complete
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${getNotificationStyle(notification.type)}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500" />}
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

        {/* Executive Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Executive Summary</h2>
              <p className="text-gray-700 mb-4">
                This report analyzes your professional learning engagement against selected educational frameworks, 
                providing evidence of professional growth and actionable recommendations for continued development.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysis.key_insights?.length || 0}</div>
                  <div className="text-sm text-blue-800">Key Insights</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysis.recommendations?.length || 0}</div>
                  <div className="text-sm text-green-800">Recommendations</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {tabs.filter(tab => tab.available && tab.id !== 'overview' && tab.id !== 'insights').length}
                  </div>
                  <div className="text-sm text-purple-800">Frameworks Analyzed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Framework Analysis Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.available === false}
                  className={`flex items-center flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : tab.available === false
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                  {tab.available === false && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">N/A</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Learning Analysis Overview</h2>
                
                {/* Framework Coverage */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Frameworks Analyzed</h3>
                    <div className="space-y-2">
                      {tabs.filter(tab => tab.available && tab.id !== 'overview' && tab.id !== 'insights').map((tab) => (
                        <div key={tab.id} className="flex items-center text-blue-800">
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                          {tab.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Learning Outcomes</h3>
                    <div className="space-y-2 text-green-800">
                      <div>✓ Professional standards alignment identified</div>
                      <div>✓ Growth opportunities mapped</div>
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
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AITSL Professional Standards Analysis</h2>
                    <p className="text-gray-600">Australian Professional Standards for Teachers</p>
                  </div>
                </div>
                
                {analysis.aitsl_analysis.overall_compliance && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-2">Overall Compliance Assessment</h3>
                    <p className="text-green-800">{analysis.aitsl_analysis.overall_compliance}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {analysis.aitsl_analysis.standards_addressed?.length > 0 ? (
                    analysis.aitsl_analysis.standards_addressed.map((standard, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {index + 1}
                          </span>
                          {standard.standard}
                        </h3>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-700 mb-2">Evidence</h4>
                            <p className="text-gray-600 text-sm">{standard.evidence}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-700 mb-2">Growth Demonstrated</h4>
                            <p className="text-gray-600 text-sm">{standard.growth_demonstrated}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-700 mb-2">Implementation Opportunities</h4>
                            <p className="text-gray-600 text-sm">{standard.implementation_opportunities}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No AITSL standards analysis available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Teaching Tab */}
            {activeTab === 'quality' && analysis.quality_teaching && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpen className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quality Teaching Model Analysis</h2>
                    <p className="text-gray-600">Three dimensions of quality teaching</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      Intellectual Quality
                    </h3>
                    <p className="text-gray-700">{analysis.quality_teaching.intellectual_quality || 'No analysis available'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      Quality Learning Environment
                    </h3>
                    <p className="text-gray-700">{analysis.quality_teaching.learning_environment || 'No analysis available'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6 bg-purple-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      Significance
                    </h3>
                    <p className="text-gray-700">{analysis.quality_teaching.significance || 'No analysis available'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Visible Thinking Tab */}
            {activeTab === 'thinking' && analysis.visible_thinking && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Visible Thinking Routines Analysis</h2>
                    <p className="text-gray-600">Harvard Project Zero thinking strategies</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 bg-purple-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Routines Identified</h3>
                    {analysis.visible_thinking.routines_identified?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.visible_thinking.routines_identified.map((routine, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                            {routine}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No specific routines identified</p>
                    )}
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Strategies</h3>
                    <p className="text-gray-700">{analysis.visible_thinking.implementation_strategies || 'No implementation strategies provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pembroke Pedagogies Tab */}
            {activeTab === 'pembroke' && analysis.pembroke_pedagogies && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <School className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pembroke Effective Pedagogies Analysis</h2>
                    <p className="text-gray-600">School-specific pedagogical approaches</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 bg-indigo-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Alignment Assessment</h3>
                    <p className="text-gray-700">{analysis.pembroke_pedagogies.alignment || 'No alignment analysis available'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Opportunities</h3>
                    <p className="text-gray-700">{analysis.pembroke_pedagogies.integration_opportunities || 'No integration opportunities identified'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modern Classrooms Tab */}
            {activeTab === 'modern' && analysis.modern_classrooms && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-orange-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Modern Classrooms Project Analysis</h2>
                    <p className="text-gray-600">Self-paced, mastery-based learning approaches</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 bg-orange-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Alignment Assessment</h3>
                    <p className="text-gray-700">{analysis.modern_classrooms.alignment || 'No alignment analysis available'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Opportunities</h3>
                    <p className="text-gray-700">{analysis.modern_classrooms.integration_opportunities || 'No integration opportunities identified'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Key Insights & Recommendations</h2>
                    <p className="text-gray-600">Actionable takeaways from your professional learning</p>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <TrendingUp className="w-3 h-3 text-white" />
                      </div>
                      Key Insights
                    </h3>
                    {analysis.key_insights?.length > 0 ? (
                      <ul className="space-y-3">
                        {analysis.key_insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="text-gray-700">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No key insights available</p>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      Recommendations
                    </h3>
                    {analysis.recommendations?.length > 0 ? (
                      <ul className="space-y-3">
                        {analysis.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="text-gray-700">{recommendation}</span>
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
        </div>

        {/* Next Steps Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 Your Professional Development Journey</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Implement Strategies</h3>
              <p className="text-gray-700 text-sm">Apply the specific strategies and techniques learned in your classroom practice</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Document Outcomes</h3>
              <p className="text-gray-700 text-sm">Keep track of implementation attempts and student learning outcomes</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Share & Reflect</h3>
              <p className="text-gray-700 text-sm">Share learnings with colleagues and reflect on your professional growth</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}