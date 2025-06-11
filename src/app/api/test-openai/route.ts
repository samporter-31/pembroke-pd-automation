import { NextRequest, NextResponse } from 'next/server'
import { testOpenAI } from '@/lib/openai'

export async function GET() {
  try {
    console.log('Testing OpenAI API...')
    const result = await testOpenAI()
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: 'OpenAI API is working!',
        response: result 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'OpenAI API test failed' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing OpenAI API',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
