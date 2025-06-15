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

    console.log('Generating focus questions for:', title)
    console.log('Agenda preview:', agenda.substring(0, 200) + '...')

    // Generate focus questions using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `You are an expert in professional development for educators. Analyze this PD agenda and create 3-8 highly specific focus questions that will guide participants' reflection and note-taking.

PD SESSION TITLE: ${title}
DETAILED AGENDA: ${agenda}

CRITICAL INSTRUCTIONS:
1. Create questions that are DIRECTLY RELATED to the specific content in the agenda
2. Use terminology and concepts explicitly mentioned in the agenda
3. Questions should prompt deep reflection on implementation
4. Focus on practical application in their teaching context
5. Include questions about challenges and adaptations
6. Reference specific strategies, tools, or frameworks mentioned

EXAMPLE - If agenda mentions "differentiated instruction in mathematics":
- DON'T ask: "What did you learn today?"
- DO ask: "How will you differentiate mathematical tasks for students with varying readiness levels in your classroom?"

Create 3-8 thought-provoking questions that help teachers:
- Connect the content to their current practice
- Plan specific implementation strategies
- Anticipate challenges and solutions
- Consider impact on different student groups
- Align with professional standards

Return ONLY a JSON object with this structure:
{
  "focus_questions": [
    "Specific, thought-provoking question based on the agenda content",
    "Another specific question...",
    "..."
  ]
}

Make every question highly relevant to the actual PD content provided.`
      }],
      max_tokens: 2000,
      temperature: 0.7
    })

    let rawResponse = response.choices[0].message.content || '{}'
    console.log('OpenAI response:', rawResponse)

    // Clean up markdown formatting if present
    rawResponse = rawResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let formStructure
    try {
      const parsed = JSON.parse(rawResponse)
      formStructure = {
        focus_questions: parsed.focus_questions || []
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      
      // Fallback questions based on agenda content
      const agendaLower = agenda.toLowerCase()
      let fallbackQuestions = []

      if (agendaLower.includes('differentiat') || agendaLower.includes('adapt')) {
        fallbackQuestions.push(
          "What specific differentiation strategies from today's session will you implement first, and how will you adapt them for your students?",
          "Which student groups in your classroom will most benefit from these approaches, and what modifications might you need to make?"
        )
      }

      if (agendaLower.includes('assess') || agendaLower.includes('feedback')) {
        fallbackQuestions.push(
          "How will you integrate the assessment strategies discussed into your current evaluation practices?",
          "What specific feedback techniques will you trial, and how will you measure their impact on student learning?"
        )
      }

      if (agendaLower.includes('technolog') || agendaLower.includes('digital')) {
        fallbackQuestions.push(
          "Which digital tools or platforms presented today align best with your teaching goals, and how will you introduce them to students?",
          "What potential challenges do you anticipate with technology integration, and what support might you need?"
        )
      }

      // Always add some general reflection questions
      fallbackQuestions.push(
        "What key concepts or strategies from this session resonated most with your teaching philosophy and why?",
        "How will you know if your implementation of these ideas is successful? What will you look for in student outcomes?",
        "What questions or areas of uncertainty do you still have that you'd like to explore further?"
      )

      formStructure = {
        focus_questions: fallbackQuestions.slice(0, 5) // Limit to 5 questions
      }
    }

    console.log('Generated', formStructure.focus_questions.length, 'focus questions')

    // Save agenda AND form structure to database
    const { data: agendaData, error: agendaError } = await supabase
      .from('agendas')
      .insert([{ 
        title, 
        content: agenda,
        form_structure: formStructure
      }])
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