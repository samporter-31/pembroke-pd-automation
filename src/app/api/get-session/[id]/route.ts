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

    // Clean query - fixed without updated_at column
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        participant_name,
        notes,
        created_at,
        agenda_id,
        agendas (
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
      console.log('No session data found for ID:', sessionId)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    console.log('✅ Session data retrieved successfully')
    console.log('Participant:', sessionData.participant_name)
    console.log('Agenda title:', sessionData.agendas.title)
    console.log('Form sections:', sessionData.agendas.form_structure?.sections?.length || 0)

    // Return clean session data
    return NextResponse.json({
      success: true,
      session: {
        id: sessionData.id,
        participant_name: sessionData.participant_name,
        form_structure: sessionData.agendas.form_structure,
        notes: sessionData.notes,
        created_at: sessionData.created_at,
        agendas: sessionData.agendas
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

// Clean method handling
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}