import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test function
export async function testSupabase() {
  try {
    const { data, error } = await supabase
      .from('agendas')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return { success: true, message: 'Supabase connection working!' }
  } catch (error) {
    console.error('Supabase test error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}