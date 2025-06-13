import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { agendaId } = await request.json()

    if (!agendaId) {
      return NextResponse.json(
        { error: 'Agenda ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching session data for agenda:', agendaId)

    // Fetch agenda and form structure
    const { data: agendaData, error: agendaError } = await supabase
      .from('agendas')
      .select('*')
      .eq('id', agendaId)
      .single()

    if (agendaError || !agendaData) {
      console.error('Agenda not found:', agendaError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    console.log('Session data found, form structure available:', !!agendaData.form_structure)

    return NextResponse.json({
      success: true,
      agenda: agendaData,
      formStructure: agendaData.form_structure
    })

  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    )
  }
}