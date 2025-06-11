import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { agenda, title } = await request.json()

    if (!agenda || !title) {
      return NextResponse.json(
        { error: 'Agenda and title are required' },
        { status: 400 }
      )
    }

    console.log('Generating form for:', title)

    // Generate form structure using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `Create a note-taking form for this PD agenda. Return ONLY valid JSON without markdown formatting:

AGENDA: ${agenda}

Return this exact structure:
{
  "sections": [
    {
      "title": "Key Learning Points",
      "description": "Main concepts and insights",
      "fields": [
        {
          "id": "learning_1",
          "label": "What were the main learning objectives?",
          "type": "textarea",
          "placeholder": "Describe the key learning objectives..."
        }
      ]
    },
    {
      "title": "Implementation Ideas", 
      "description": "How you'll apply this learning",
      "fields": [
        {
          "id": "implementation_1",
          "label": "How will you implement these ideas?",
          "type": "textarea", 
          "placeholder": "Describe your implementation plans..."
        }
      ]
    }
  ]
}`
      }],
      max_tokens: 800
    })

    let rawResponse = response.choices[0].message.content || '{}'
    console.log('OpenAI raw response:', rawResponse)

    // Clean up markdown formatting if present
    rawResponse = rawResponse
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim()

    console.log('Cleaned response:', rawResponse)

    let formStructure
    try {
      formStructure = JSON.parse(rawResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Cleaned response was:', rawResponse)
      
      // Fallback form structure if parsing fails
      formStructure = {
        sections: [
          {
            title: "Key Learning Points",
            description: "Main concepts and insights from the session",
            fields: [
              {
                id: "learning_objectives",
                label: "What were the main learning objectives?",
                type: "textarea",
                placeholder: "Describe the key learning objectives..."
              },
              {
                id: "key_concepts",
                label: "What key concepts were covered?",
                type: "textarea",
                placeholder: "List the main concepts discussed..."
              }
            ]
          },
          {
            title: "Implementation Ideas",
            description: "How you'll apply this learning",
            fields: [
              {
                id: "implementation_plans",
                label: "How will you implement these ideas?",
                type: "textarea",
                placeholder: "Describe your implementation plans..."
              },
              {
                id: "action_items",
                label: "What are your immediate action items?",
                type: "textarea",
                placeholder: "List specific actions you'll take..."
              }
            ]
          }
        ]
      }
    }

    console.log('Final form structure:', formStructure)

    // Save agenda to database
    const { data: agendaData, error: agendaError } = await supabase
      .from('agendas')
      .insert([{ title, content: agenda }])
      .select()
      .single()

    if (agendaError) {
      console.error('Supabase error:', agendaError)
      throw agendaError
    }

    console.log('Agenda saved with ID:', agendaData.id)

    return NextResponse.json({
      success: true,
      agendaId: agendaData.id,
      formStructure
    })

  } catch (error) {
    console.error('Form generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}