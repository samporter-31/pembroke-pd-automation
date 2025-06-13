import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Input validation
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    console.log('Fetching session data for:', sessionId)

    // Fetch session with related agenda data
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        participant_name,
        form_structure,
        notes,
        created_at,
        agendas (
          id,
          title,
          content,
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

    // Return the session data
    return NextResponse.json({
      success: true,
      session: {
        id: sessionData.id,
        participant_name: sessionData.participant_name,
        form_structure: sessionData.form_structure,
        notes: sessionData.notes,
        created_at: sessionData.created_at,
        agendas: sessionData.agendas
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Unexpected error in get-session API:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving the session'
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
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