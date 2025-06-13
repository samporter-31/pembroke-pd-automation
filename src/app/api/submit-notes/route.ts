import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface FrameworkAnalysis {
  aitsl_analysis?: {
    standards_addressed: Array<{
      standard: string
      evidence: string
      growth_demonstrated: string
      implementation_opportunities: string
    }>
    overall_compliance: string
  }
  quality_teaching?: {
    intellectual_quality: string
    learning_environment: string
    significance: string
  }
  visible_thinking?: {
    routines_identified: string[]
    implementation_strategies: string
  }
  pembroke_pedagogies?: {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, general_notes, responses, selected_frameworks } = body

    // Input validation
    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Validate selected frameworks
    if (!selected_frameworks || typeof selected_frameworks !== 'object') {
      return NextResponse.json(
        { error: 'Framework selection is required' },
        { status: 400 }
      )
    }

    const hasSelectedFramework = Object.values(selected_frameworks).some(Boolean)
    if (!hasSelectedFramework) {
      return NextResponse.json(
        { error: 'At least one framework must be selected' },
        { status: 400 }
      )
    }

    console.log('Processing notes submission for session:', session_id)
    console.log('Selected frameworks:', selected_frameworks)

    // Get session and agenda data
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        agendas (*)
      `)
      .eq('id', session_id)
      .single()

    if (sessionError || !sessionData) {
      console.error('Session fetch error:', sessionError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Save notes to session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        notes: {
          general_notes,
          responses,
          selected_frameworks
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', session_id)

    if (updateError) {
      console.error('Notes update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to save notes' },
        { status: 500 }
      )
    }

    // Generate framework analysis based on selected frameworks
    const analysis = await generateFrameworkAnalysis(
      sessionData.agendas.content,
      general_notes,
      responses,
      selected_frameworks
    )

    // Save analysis to reports table
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        session_id: session_id,
        framework_analysis: analysis,
        selected_frameworks: selected_frameworks,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (reportError) {
      console.error('Report save error:', reportError)
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notes saved and analysis generated successfully',
      report_id: reportData.id
    })

  } catch (error) {
    console.error('Submit notes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateFrameworkAnalysis(
  agendaContent: string,
  generalNotes: string,
  responses: Record<string, string>,
  selectedFrameworks: Record<string, boolean>
): Promise<FrameworkAnalysis> {
  
  // Combine all notes into one text for analysis
  const allNotes = [
    `General Notes: ${generalNotes}`,
    ...Object.entries(responses).map(([questionId, response]) => 
      `Response ${questionId}: ${response}`
    )
  ].join('\n\n')

  // Build framework-specific analysis prompts
  const frameworkPrompts = []
  
  if (selectedFrameworks.aitsl) {
    frameworkPrompts.push(`
    AITSL Standards Analysis:
    Analyze against Australian Professional Standards for Teachers:
    1. Know students and how they learn
    2. Know the content and how to teach it
    3. Plan for and implement effective teaching and learning
    4. Create and maintain supportive and safe learning environments
    5. Assess, provide feedback and report on student learning
    6. Engage in professional learning
    7. Engage professionally with colleagues, parents/carers and the community
    
    For each relevant standard, provide:
    - Evidence from the notes
    - Growth demonstrated
    - Implementation opportunities
    `)
  }

  if (selectedFrameworks.qtm) {
    frameworkPrompts.push(`
    Quality Teaching Model Analysis:
    Analyze against three dimensions:
    1. Intellectual Quality (deep knowledge, problematic knowledge, higher-order thinking, metalanguage, substantive communication)
    2. Quality Learning Environment (explicit quality criteria, engagement, high expectations, social support, students' self-regulation, student direction)
    3. Significance (background knowledge, cultural knowledge, knowledge integration, inclusivity, connectedness, narrative)
    `)
  }

  if (selectedFrameworks.visible_thinking) {
    frameworkPrompts.push(`
    Visible Thinking Routines Analysis:
    Identify any thinking routines or strategies mentioned such as:
    - See-Think-Wonder
    - Think-Pair-Share
    - 3-2-1 Bridge
    - Chalk Talk
    - Compass Points
    - Connect-Extend-Challenge
    Provide implementation strategies for classroom use.
    `)
  }

  if (selectedFrameworks.modern_classrooms) {
    frameworkPrompts.push(`
    Modern Classrooms Project Analysis:
    Analyze alignment with:
    - Self-paced learning
    - Mastery-based progression
    - Choice and flexibility
    - Blended learning approaches
    - Student agency and ownership
    `)
  }

  if (selectedFrameworks.pembroke) {
    frameworkPrompts.push(`
    Pembroke Effective Pedagogies Analysis:
    Analyze alignment with school-specific pedagogical approaches:
    - Collaborative learning strategies
    - Inquiry-based learning
    - Differentiated instruction
    - Student-centered approaches
    - Assessment for learning
    `)
  }

  const systemPrompt = `You are an expert educational analyst. Analyze the following professional learning notes against the selected educational frameworks. 

  Context:
  Session Agenda: ${agendaContent}
  
  Learning Notes: ${allNotes}
  
  Analysis Requirements:
  ${frameworkPrompts.join('\n')}
  
  Provide your analysis in the following JSON structure, only including sections for selected frameworks:
  
  {
    ${selectedFrameworks.aitsl ? `"aitsl_analysis": {
      "standards_addressed": [
        {
          "standard": "Standard name",
          "evidence": "Specific evidence from notes",
          "growth_demonstrated": "How growth is shown",
          "implementation_opportunities": "Future implementation ideas"
        }
      ],
      "overall_compliance": "Overall assessment"
    },` : ''}
    ${selectedFrameworks.qtm ? `"quality_teaching": {
      "intellectual_quality": "Analysis of intellectual quality dimension",
      "learning_environment": "Analysis of learning environment dimension", 
      "significance": "Analysis of significance dimension"
    },` : ''}
    ${selectedFrameworks.visible_thinking ? `"visible_thinking": {
      "routines_identified": ["List of routines mentioned or applicable"],
      "implementation_strategies": "How to implement in classroom"
    },` : ''}
    ${selectedFrameworks.modern_classrooms ? `"modern_classrooms": {
      "alignment": "How learning aligns with modern classrooms principles",
      "integration_opportunities": "Ways to integrate these approaches"
    },` : ''}
    ${selectedFrameworks.pembroke ? `"pembroke_pedagogies": {
      "alignment": "Alignment with Pembroke pedagogical approaches",
      "integration_opportunities": "Integration opportunities"
    },` : ''}
    "key_insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  }
  
  Ensure all text is substantive and specific to the learning content provided.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const analysisText = completion.choices[0].message.content
    if (!analysisText) {
      throw new Error('No analysis generated')
    }

    // Parse the JSON response
    const analysis = JSON.parse(analysisText)
    return analysis

  } catch (error) {
    console.error('OpenAI analysis error:', error)
    
    // Return a fallback analysis structure
    const fallbackAnalysis: FrameworkAnalysis = {
      key_insights: ["Analysis could not be completed at this time"],
      recommendations: ["Please try regenerating the report"]
    }

    // Add empty structures for selected frameworks
    if (selectedFrameworks.aitsl) {
      fallbackAnalysis.aitsl_analysis = {
        standards_addressed: [],
        overall_compliance: "Analysis pending"
      }
    }
    
    if (selectedFrameworks.qtm) {
      fallbackAnalysis.quality_teaching = {
        intellectual_quality: "Analysis pending",
        learning_environment: "Analysis pending",
        significance: "Analysis pending"
      }
    }
    
    if (selectedFrameworks.visible_thinking) {
      fallbackAnalysis.visible_thinking = {
        routines_identified: [],
        implementation_strategies: "Analysis pending"
      }
    }
    
    if (selectedFrameworks.modern_classrooms) {
      fallbackAnalysis.modern_classrooms = {
        alignment: "Analysis pending",
        integration_opportunities: "Analysis pending"
      }
    }
    
    if (selectedFrameworks.pembroke) {
      fallbackAnalysis.pembroke_pedagogies = {
        alignment: "Analysis pending",
        integration_opportunities: "Analysis pending"
      }
    }

    return fallbackAnalysis
  }
}