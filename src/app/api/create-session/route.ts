import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { agenda_id, participant_name } = await request.json()

    // Input validation
    if (!agenda_id) {
      return NextResponse.json(
        { error: 'Agenda ID is required' },
        { status: 400 }
      )
    }

    if (!participant_name || participant_name.trim() === '') {
      return NextResponse.json(
        { error: 'Participant name is required' },
        { status: 400 }
      )
    }

    console.log('Creating session for agenda:', agenda_id, 'participant:', participant_name)

    // Verify the agenda exists
    const { data: agendaData, error: agendaError } = await supabase
      .from('agendas')
      .select('id, title')
      .eq('id', agenda_id)
      .single()

    if (agendaError || !agendaData) {
      console.error('Agenda not found:', agendaError)
      return NextResponse.json(
        { error: 'Agenda not found' },
        { status: 404 }
      )
    }

    // Create a new session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        agenda_id: agenda_id,
        participant_name: participant_name.trim(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    console.log('Session created successfully:', sessionData.id)

    return NextResponse.json({
      success: true,
      session_id: sessionData.id,
      agenda_title: agendaData.title,
      message: 'Session created successfully'
    })

  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}