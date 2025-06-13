import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: sessionId } = await params

    // Input validation
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching report for session:', sessionId)

    // Fetch session data with related agenda and report
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        participant_name,
        created_at,
        notes,
        agendas!inner (
          id,
          title,
          content,
          created_at
        ),
        reports (
          id,
          framework_analysis,
          selected_frameworks,
          created_at
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error('Database error:', sessionError)
      
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      )
    }

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get the report data
    const report = sessionData.reports?.[0]
    if (!report) {
      return NextResponse.json(
        { 
          error: 'Report not yet generated',
          message: 'Please complete your session notes first, then your report will be generated automatically.'
        },
        { status: 404 }
      )
    }

    console.log('Report data found')

    return NextResponse.json({
      success: true,
      session: {
        id: sessionData.id,
        participant_name: sessionData.participant_name,
        created_at: sessionData.created_at,
        notes: sessionData.notes
      },
      agenda: sessionData.agendas,
      report: {
        id: report.id,
        framework_analysis: report.framework_analysis,
        selected_frameworks: report.selected_frameworks,
        created_at: report.created_at
      },
      analysis: report.framework_analysis
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Unexpected error in get-report API:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving the report'
      },
      { status: 500 }
    )
  }
}