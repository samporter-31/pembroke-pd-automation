'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, FileText, Download, Home } from 'lucide-react'

// Type definitions for better TypeScript support
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
  // Next.js hooks for routing
  const params = useParams()
  const router = useRouter()
  
  // React state management
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('aitsl')

  // Effect hook - runs when component mounts or params.id changes
  useEffect(() => {
    // Only fetch if we have an ID
    if (params.id) {
      fetchReport()
    }
  }, [params.id])

  // Async function to fetch report data
  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Make API call with proper error handling
      const response = await fetch(`/api/get-report/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        // Handle different HTTP errors
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
      // Always runs, regardless of success or failure
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      // TODO: Implement PDF export
      alert('Export functionality coming soon!')
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  // Loading state - shown while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your professional learning report...</p>
        </div>
      </div>
    )
  }

  // Error state - shown if something went wrong
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
            className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Destructure data for easier access
  const { session, agenda, analysis } = reportData

  // Main render - only shown when data is loaded successfully
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Professional Learning Report
              </h1>
              <div className="grid gap-2 text-sm text-gray-600">
                <div><span className="font-medium">Participant:</span> {session.participant_name}</div>
                <div><span className="font-medium">Session:</span> {agenda.title}</div>
                <div><span className="font-medium">Date:</span> {new Date(session.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                New Session
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <FileText className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-3">Executive Summary</h2>
                <p className="text-blue-800">
                  This report analyzes professional learning engagement against key educational frameworks, 
                  providing evidence of professional growth and recommendations for continued development.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Framework Analysis Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-max">
              {[
                { id: 'aitsl', name: 'AITSL Standards', icon: '🎯' },
                { id: 'quality', name: 'Quality Teaching', icon: '📚' },
                { id: 'thinking', name: 'Visible Thinking', icon: '💭' },
                { id: 'pembroke', name: 'Pembroke Pedagogies', icon: '🏫' },
                { id: 'insights', name: 'Key Insights', icon: '💡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* AITSL Standards Tab */}
            {activeTab === 'aitsl' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    🎯 AITSL Professional Standards Analysis
                  </h2>
                  {analysis.aitsl_analysis?.overall_compliance && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800">
                        <span className="font-medium">Overall Compliance:</span> {analysis.aitsl_analysis.overall_compliance}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {analysis.aitsl_analysis?.standards_addressed?.length > 0 ? (
                    analysis.aitsl_analysis.standards_addressed.map((standard, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {standard.standard}
                        </h3>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Evidence</h4>
                            <p className="text-gray-600 text-sm">{standard.evidence}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Growth Demonstrated</h4>
                            <p className="text-gray-600 text-sm">{standard.growth_demonstrated}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Implementation Opportunities</h4>
                            <p className="text-gray-600 text-sm">{standard.implementation_opportunities}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No AITSL standards analysis available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Teaching Tab */}
            {activeTab === 'quality' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📚 Quality Teaching Model Analysis
                </h2>
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Intellectual Quality</h3>
                    <p className="text-gray-700">{analysis.quality_teaching?.intellectual_quality || 'No analysis available'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Learning Environment</h3>
                    <p className="text-gray-700">{analysis.quality_teaching?.learning_environment || 'No analysis available'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Significance</h3>
                    <p className="text-gray-700">{analysis.quality_teaching?.significance || 'No analysis available'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Visible Thinking Tab */}
            {activeTab === 'thinking' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  💭 Visible Thinking Routines Analysis
                </h2>
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Routines Identified</h3>
                    {analysis.visible_thinking?.routines_identified?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.visible_thinking.routines_identified.map((routine, index) => (
                          <li key={index} className="text-gray-700">{routine}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No specific routines identified</p>
                    )}
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Strategies</h3>
                    <p className="text-gray-700">{analysis.visible_thinking?.implementation_strategies || 'No implementation strategies provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pembroke Pedagogies Tab */}
            {activeTab === 'pembroke' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🏫 Pembroke Effective Pedagogies Analysis
                </h2>
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Alignment</h3>
                    <p className="text-gray-700">{analysis.pembroke_pedagogies?.alignment || 'No alignment analysis available'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Opportunities</h3>
                    <p className="text-gray-700">{analysis.pembroke_pedagogies?.integration_opportunities || 'No integration opportunities identified'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  💡 Key Insights & Recommendations
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                    {analysis.key_insights?.length > 0 ? (
                      <ul className="space-y-2">
                        {analysis.key_insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 font-bold">•</span>
                            <span className="text-gray-700">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No key insights available</p>
                    )}
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    {analysis.recommendations?.length > 0 ? (
                      <ul className="space-y-2">
                        {analysis.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2 font-bold">→</span>
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
        <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Next Steps</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Implement Strategies</h3>
              <p className="text-gray-600 text-sm">Apply the specific strategies and techniques learned in your classroom practice</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Outcomes</h3>
              <p className="text-gray-600 text-sm">Keep track of implementation attempts and student outcomes</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share & Reflect</h3>
              <p className="text-gray-600 text-sm">Share learnings with colleagues and reflect on professional growth</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}