import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This is a dynamic API route in Next.js App Router
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Input validation - security best practice
    const sessionId = params.id

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Validate that sessionId is a valid UUID format (basic security)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    console.log('Fetching report for session:', sessionId)

    // Use Supabase RLS (Row Level Security) for data protection
    // This query uses joins to get related data in one call
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        participant_name,
        created_at,
        notes,
        agendas (
          id,
          title,
          content,
          created_at
        ),
        reports (
          id,
          framework_analysis,
          created_at
        )
      `)
      .eq('id', sessionId)
      .single()

    // Handle database errors
    if (sessionError) {
      console.error('Database error:', sessionError)
      
      // Don't expose internal database errors to clients
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Report not found' },
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

    // Check if report exists
    const report = sessionData.reports?.[0]
    if (!report) {
      return NextResponse.json(
        { 
          error: 'Report not yet generated',
          message: 'Please wait while your report is being analyzed'
        },
        { status: 404 }
      )
    }

    // Structure the response data
    const responseData = {
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
        created_at: report.created_at
      },
      analysis: report.framework_analysis
    }

    console.log('Report data successfully retrieved')

    // Return success response with proper headers
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Unexpected error in get-report API:', error)
    
    // Don't expose internal errors to clients
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving the report'
      },
      { status: 500 }
    )
  }
}

// Optional: Add other HTTP methods if needed
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}