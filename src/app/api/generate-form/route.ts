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
    console.log('Agenda preview:', agenda.substring(0, 200) + '...')

    // Generate form structure using OpenAI with enhanced prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // ✅ FIXED: Using correct model name
      messages: [{
        role: "user",
        content: `You are an expert in professional development for educators. Create a HIGHLY SPECIFIC note-taking form based on this exact PD agenda content.

PD SESSION TITLE: ${title}
DETAILED AGENDA: ${agenda}

CRITICAL INSTRUCTIONS:
1. Analyze the SPECIFIC topics, methods, and content mentioned in the agenda
2. Create questions that are DIRECTLY RELATED to the agenda content - NOT generic questions
3. Use terminology and concepts from the actual agenda
4. Reference specific teaching strategies, tools, or frameworks mentioned
5. Make questions actionable for immediate classroom implementation

EXAMPLE - If agenda mentions "differentiated instruction in mathematics":
- DON'T ask: "What were the main learning objectives?"
- DO ask: "How will you adapt mathematical content delivery for students with different learning styles and readiness levels?"

Create 3-4 targeted sections with 2-3 specific questions each.

Return ONLY valid JSON in this structure:
{
  "sections": [
    {
      "title": "Specific Topic from Agenda",
      "description": "What participants will capture about this specific topic",
      "fields": [
        {
          "id": "unique_specific_id",
          "label": "Highly specific question based on agenda content",
          "type": "textarea",
          "placeholder": "Specific guidance related to the actual PD content"
        }
      ]
    }
  ]
}

Focus on creating questions that help teachers capture:
- Specific strategies they can implement immediately
- How to adapt techniques for their particular student populations
- Assessment methods related to the agenda topics
- Reflection on how these specific approaches connect to their current practice
- AITSL standards alignment opportunities for the specific content covered

Make every question highly relevant to the actual agenda content provided.`
      }],
      max_tokens: 3000
    })

    let rawResponse = response.choices[0].message.content || '{}'
    console.log('OpenAI raw response length:', rawResponse.length)
    console.log('OpenAI raw response preview:', rawResponse.substring(0, 300))

    // Clean up markdown formatting if present
    rawResponse = rawResponse
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim()

    console.log('Cleaned response preview:', rawResponse.substring(0, 300))

    let formStructure
    try {
      formStructure = JSON.parse(rawResponse)
      console.log('Successfully parsed JSON. Sections count:', formStructure.sections?.length || 0)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Full cleaned response:', rawResponse)
      
      // Enhanced fallback form structure based on agenda content
      const agendaLower = agenda.toLowerCase()
      let fallbackSections = []

      // Try to create somewhat relevant sections based on agenda keywords
      if (agendaLower.includes('differentiat') || agendaLower.includes('adapt') || agendaLower.includes('diverse')) {
        fallbackSections.push({
          title: "Differentiation Strategies",
          description: "Specific approaches for adapting instruction",
          fields: [
            {
              id: "differentiation_techniques",
              label: "What specific differentiation techniques were discussed?",
              type: "textarea",
              placeholder: "List the concrete strategies for adapting content, process, or product..."
            },
            {
              id: "student_grouping",
              label: "How will you group students to support diverse learning needs?",
              type: "textarea",
              placeholder: "Describe grouping strategies and rationale..."
            }
          ]
        })
      }

      if (agendaLower.includes('assess') || agendaLower.includes('feedback') || agendaLower.includes('evaluat')) {
        fallbackSections.push({
          title: "Assessment and Feedback",
          description: "Evaluation and feedback strategies discussed",
          fields: [
            {
              id: "assessment_methods",
              label: "What assessment strategies were explored?",
              type: "textarea",
              placeholder: "Detail specific assessment techniques and tools..."
            }
          ]
        })
      }

      if (agendaLower.includes('technolog') || agendaLower.includes('digital') || agendaLower.includes('tool')) {
        fallbackSections.push({
          title: "Technology Integration",
          description: "Digital tools and technology applications",
          fields: [
            {
              id: "tech_tools",
              label: "Which technology tools or platforms were demonstrated?",
              type: "textarea",
              placeholder: "List specific tools and their applications..."
            }
          ]
        })
      }

      // Default sections if no keywords match
      if (fallbackSections.length === 0) {
        fallbackSections = [
          {
            title: "Key Strategies and Methods",
            description: "Specific teaching strategies and methods covered",
            fields: [
              {
                id: "teaching_strategies",
                label: "What specific teaching strategies were demonstrated or discussed?",
                type: "textarea",
                placeholder: "List concrete strategies and methods..."
              },
              {
                id: "implementation_plan",
                label: "How will you implement these strategies in your classroom?",
                type: "textarea",
                placeholder: "Create a specific implementation plan..."
              }
            ]
          },
          {
            title: "Student Impact and Outcomes",
            description: "Expected impact on student learning",
            fields: [
              {
                id: "student_benefits",
                label: "How will these approaches benefit your specific students?",
                type: "textarea",
                placeholder: "Consider your student demographics and needs..."
              }
            ]
          }
        ]
      }

      formStructure = { sections: fallbackSections }
      console.log('Using fallback form structure with', fallbackSections.length, 'sections')
    }

    console.log('Final form structure sections:', formStructure.sections?.length || 0)

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