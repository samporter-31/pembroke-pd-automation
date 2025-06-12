import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { agendaId, participantName, genericNotes, structuredResponses } = await request.json()

    if (!agendaId || !participantName) {
      return NextResponse.json(
        { error: 'Agenda ID and participant name are required' },
        { status: 400 }
      )
    }

    console.log('Processing notes for:', participantName)

    // Get the original agenda from database
    const { data: agendaData, error: agendaError } = await supabase
      .from('agendas')
      .select('*')
      .eq('id', agendaId)
      .single()

    if (agendaError || !agendaData) {
      console.error('Agenda not found:', agendaError)
      return NextResponse.json(
        { error: 'Agenda not found' },
        { status: 404 }
      )
    }

    // Combine all notes for analysis
    const allNotes = {
      genericNotes: genericNotes || '',
      structuredResponses: structuredResponses || {}
    }

    // Save session to database first
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        agenda_id: agendaId,
        participant_name: participantName,
        notes: allNotes
      }])
      .select()
      .single()

    if (sessionError) {
      console.error('Session save error:', sessionError)
      throw sessionError
    }

    console.log('Session saved with ID:', sessionData.id)

    // Generate framework analysis with OpenAI
    console.log('Starting framework analysis...')
    
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `Analyze these professional development notes and map them to educational frameworks:

ORIGINAL PD AGENDA:
${agendaData.content}

PARTICIPANT: ${participantName}

GENERIC NOTES:
${genericNotes || 'No generic notes provided'}

STRUCTURED RESPONSES:
${Object.entries(structuredResponses || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}

Provide a comprehensive analysis mapping this learning to:

1. AITSL PROFESSIONAL STANDARDS:
For each relevant standard (1-7), identify:
- Evidence of engagement with the standard
- Specific examples from the notes
- Professional growth demonstrated
- Implementation opportunities

Standards Reference:
- Standard 1: Know students and how they learn
- Standard 2: Know the content and how to teach it  
- Standard 3: Plan for and implement effective teaching and learning
- Standard 4: Create and maintain supportive learning environments
- Standard 5: Assess, provide feedback and report on student learning
- Standard 6: Engage in professional learning
- Standard 7: Engage professionally with colleagues, parents/carers and the community

2. QUALITY TEACHING MODEL:
Analyze alignment with:
- Intellectual Quality: Deep knowledge, higher-order thinking, substantive communication
- Quality Learning Environment: Explicit quality criteria, high expectations, social support
- Significance: Background knowledge, cultural knowledge, knowledge integration

3. VISIBLE THINKING ROUTINES:
- Which thinking routines were discussed or could be applied?
- How can the learning enhance student thinking visibility?
- Implementation strategies for thinking routines

4. PEMBROKE EFFECTIVE PEDAGOGIES:
- Connection to school-specific teaching approaches
- Alignment with institutional values and methods
- Integration opportunities with existing practices

Return a structured JSON response with:
{
  "aitsl_analysis": {
    "standards_addressed": [
      {
        "standard": "Standard X",
        "evidence": "Specific evidence from notes",
        "growth_demonstrated": "How this shows professional growth",
        "implementation_opportunities": "How to apply this learning"
      }
    ],
    "overall_compliance": "Summary of AITSL alignment"
  },
  "quality_teaching": {
    "intellectual_quality": "Analysis and evidence",
    "learning_environment": "Analysis and evidence", 
    "significance": "Analysis and evidence"
  },
  "visible_thinking": {
    "routines_identified": ["List of applicable routines"],
    "implementation_strategies": "How to use these routines"
  },
  "pembroke_pedagogies": {
    "alignment": "How this connects to Pembroke approaches",
    "integration_opportunities": "Specific ways to integrate"
  },
  "key_insights": [
    "3-5 key takeaways from the analysis"
  ],
  "recommendations": [
    "3-5 specific recommendations for professional growth"
  ]
}`
      }],
      max_tokens: 2000
    })

    let rawAnalysis = analysisResponse.choices[0].message.content || '{}'
    console.log('OpenAI analysis response length:', rawAnalysis.length)

    // Clean up markdown formatting if present
    rawAnalysis = rawAnalysis
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let frameworkAnalysis
    try {
      frameworkAnalysis = JSON.parse(rawAnalysis)
    } catch (parseError) {
      console.error('JSON parse error for analysis:', parseError)
      console.error('Raw analysis was:', rawAnalysis.substring(0, 500))
      
      // Fallback analysis structure
      frameworkAnalysis = {
        aitsl_analysis: {
          standards_addressed: [
            {
              standard: "Standard 6: Engage in professional learning",
              evidence: "Participant engaged in structured professional development session",
              growth_demonstrated: "Active participation in learning activities and reflection",
              implementation_opportunities: "Apply new knowledge and strategies in classroom practice"
            }
          ],
          overall_compliance: "Demonstrates commitment to ongoing professional learning and growth"
        },
        quality_teaching: {
          intellectual_quality: "Engaged with deep learning concepts during the session",
          learning_environment: "Participated in supportive professional learning environment",
          significance: "Connected new learning to existing practice and student needs"
        },
        visible_thinking: {
          routines_identified: ["Reflection and metacognition"],
          implementation_strategies: "Use reflection techniques to make learning visible to students"
        },
        pembroke_pedagogies: {
          alignment: "Aligns with commitment to evidence-based teaching practices",
          integration_opportunities: "Integrate new strategies with existing Pembroke teaching approaches"
        },
        key_insights: [
          "Professional learning requires active engagement and reflection",
          "New strategies must be adapted to specific teaching contexts",
          "Ongoing reflection enhances implementation success"
        ],
        recommendations: [
          "Continue to engage in regular professional learning opportunities",
          "Document implementation attempts and outcomes", 
          "Share learnings with colleagues for broader impact"
        ]
      }
    }

    console.log('Framework analysis completed')

    // Save analysis to reports table
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert([{
        session_id: sessionData.id,
        framework_analysis: frameworkAnalysis,
        ai_insights: 'Framework analysis completed using GPT-4.1-mini'
      }])
      .select()
      .single()

    if (reportError) {
      console.error('Report save error:', reportError)
      throw reportError
    }

    console.log('Analysis saved to reports table')

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      reportId: reportData.id,
      message: 'Notes analyzed and report generated successfully'
    })

  } catch (error) {
    console.error('Submit notes error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process notes and generate analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}