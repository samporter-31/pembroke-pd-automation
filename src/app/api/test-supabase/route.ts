import { NextResponse } from 'next/server'
import { testSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const result = await testSupabase()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to test Supabase connection' },
      { status: 500 }
    )
  }
}