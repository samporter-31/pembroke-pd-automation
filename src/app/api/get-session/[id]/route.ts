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

    console.log('Fetching session data for:', sessionId)

    // Fetch session with related agenda data
    // Note: only querying columns that exist in your database
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        participant_name,
        notes,
        created_at,
        agendas!inner (
          id,
          title,
          content,
          form_structure,
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

    console.log('Session data retrieved successfully')

    // Return the session data with form_structure from agendas
    return NextResponse.json({
      success: true,
      session: {
        id: sessionData.id,
        participant_name: sessionData.participant_name,
        form_structure: sessionData.agendas.form_structure, // Get from agendas table
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