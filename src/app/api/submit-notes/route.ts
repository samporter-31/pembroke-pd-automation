import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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

    if (!general_notes || general_notes.trim() === '') {
      return NextResponse.json(
        { error: 'Notes are required' },
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
    console.log('Notes length:', general_notes.length)

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
          responses: responses || {}, // Keep empty object for compatibility
          selected_frameworks
        }
      })
      .eq('id', session_id)

    if (updateError) {
      console.error('Notes update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to save notes' },
        { status: 500 }
      )
    }

    // Generate framework analysis with the single notes field
    const analysis = await generateFrameworkAnalysis(
      sessionData.agendas.content,
      sessionData.agendas.form_structure?.focus_questions || [],
      general_notes,
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
  focusQuestions: string[],
  notes: string,
  selectedFrameworks: Record<string, boolean>
): Promise<any> {
  
  // Build framework-specific analysis prompts
  const frameworkPrompts = []
  
  if (selectedFrameworks.aitsl) {
    frameworkPrompts.push(`
    AITSL Standards Analysis:
    Analyze the notes against Australian Professional Standards for Teachers:
    1. Know students and how they learn
    2. Know the content and how to teach it
    3. Plan for and implement effective teaching and learning
    4. Create and maintain supportive and safe learning environments
    5. Assess, provide feedback and report on student learning
    6. Engage in professional learning
    7. Engage professionally with colleagues, parents/carers and the community
    
    For each relevant standard identified in the notes, provide:
    - Standard name and number
    - Specific evidence from the participant's notes
    - Growth demonstrated through their reflections
    - Implementation opportunities they've identified or that emerge from their notes
    `)
  }

  if (selectedFrameworks.qtm) {
    frameworkPrompts.push(`
    Quality Teaching Model Analysis:
    Analyze the notes against the three dimensions:
    1. Intellectual Quality: Look for evidence of deep knowledge, problematic knowledge, higher-order thinking, metalanguage, substantive communication
    2. Quality Learning Environment: Look for explicit quality criteria, engagement strategies, high expectations, social support, self-regulation, student direction
    3. Significance: Look for background knowledge, cultural knowledge, knowledge integration, inclusivity, connectedness, narrative approaches
    
    For each dimension, explain how the participant's reflections demonstrate understanding and application plans.
    `)
  }

  if (selectedFrameworks.visible_thinking) {
    frameworkPrompts.push(`
    Visible Thinking Routines Analysis:
    Identify any thinking routines or strategies that align with or could be enhanced by visible thinking approaches:
    - See-Think-Wonder
    - Think-Pair-Share
    - 3-2-1 Bridge
    - Chalk Talk
    - Compass Points
    - Connect-Extend-Challenge
    - Other Project Zero routines
    
    Provide specific implementation strategies based on their notes and context.
    `)
  }

  if (selectedFrameworks.modern_classrooms) {
    frameworkPrompts.push(`
    Modern Classrooms Project Analysis:
    Analyze how the participant's notes align with:
    - Self-paced learning structures
    - Mastery-based progression
    - Student choice and flexibility
    - Blended/hybrid learning approaches
    - Student agency and ownership
    
    Identify opportunities for integrating these approaches based on their reflections.
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
    - Technology integration
    
    Connect their reflections to Pembroke's teaching philosophy and practices.
    `)
  }

  const systemPrompt = `You are an expert educational analyst specializing in teacher professional development and framework alignment.

  CONTEXT:
  Professional Development Session: ${agendaContent}
  
  Focus Questions Provided:
  ${focusQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
  
  PARTICIPANT'S REFLECTION NOTES:
  ${notes}
  
  ANALYSIS TASK:
  Analyze these professional learning notes against the selected educational frameworks. The participant may have addressed the focus questions directly or indirectly in their reflection. Look for evidence of learning, implementation plans, challenges identified, and professional growth.
  
  ${frameworkPrompts.join('\n\n')}
  
  IMPORTANT GUIDELINES:
  1. Base your analysis ONLY on what the participant actually wrote in their notes
  2. Quote specific phrases or ideas from their notes as evidence
  3. Be constructive and growth-oriented in your analysis
  4. Identify both strengths and areas for development
  5. Make connections between their reflections and the frameworks
  6. Provide practical, actionable recommendations
  
  Provide your analysis in the following JSON structure:
  
  {
    ${selectedFrameworks.aitsl ? `"aitsl_analysis": {
      "standards_addressed": [
        {
          "standard": "Standard name and number",
          "evidence": "Direct quotes or specific references from their notes",
          "growth_demonstrated": "How their reflection shows professional growth",
          "implementation_opportunities": "Practical next steps based on their context"
        }
      ],
      "overall_compliance": "Summary of how their learning aligns with AITSL standards"
    },` : ''}
    ${selectedFrameworks.qtm ? `"quality_teaching": {
      "intellectual_quality": "Analysis based on their notes",
      "learning_environment": "Analysis based on their notes", 
      "significance": "Analysis based on their notes"
    },` : ''}
    ${selectedFrameworks.visible_thinking ? `"visible_thinking": {
      "routines_identified": ["Specific routines that align with their plans"],
      "implementation_strategies": "How they can implement based on their reflections"
    },` : ''}
    ${selectedFrameworks.modern_classrooms ? `"modern_classrooms": {
      "alignment": "How their learning aligns with modern classrooms principles",
      "integration_opportunities": "Specific ways to integrate based on their notes"
    },` : ''}
    ${selectedFrameworks.pembroke ? `"pembroke_pedagogies": {
      "alignment": "Connection to Pembroke's pedagogical approaches",
      "integration_opportunities": "School-specific implementation ideas"
    },` : ''}
    "key_insights": [
      "3-5 key insights drawn from their reflection",
      "Focus on their main learning points",
      "Highlight implementation intentions"
    ],
    "recommendations": [
      "3-5 specific, actionable recommendations",
      "Based on their identified challenges and goals",
      "Practical next steps for their classroom"
    ]
  }
  
  Ensure all analysis is directly tied to the participant's actual notes and reflections.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })

    const analysisText = completion.choices[0].message.content
    if (!analysisText) {
      throw new Error('No analysis generated')
    }

    // Clean up the response
    const cleanedText = analysisText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    console.log('Analysis generated successfully')

    const analysis = JSON.parse(cleanedText)
    return analysis

  } catch (error) {
    console.error('OpenAI analysis error:', error)
    
    // Return a fallback analysis structure
    const fallbackAnalysis: any = {
      key_insights: [
        "Professional learning session completed",
        "Reflection notes captured",
        "Framework analysis in progress"
      ],
      recommendations: [
        "Review the generated report for detailed analysis",
        "Identify key strategies to implement",
        "Plan follow-up professional learning"
      ]
    }

    // Add empty structures for selected frameworks
    if (selectedFrameworks.aitsl) {
      fallbackAnalysis.aitsl_analysis = {
        standards_addressed: [],
        overall_compliance: "Analysis could not be completed"
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