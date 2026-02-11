import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수 누락:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
  throw new Error('Supabase 환경변수가 설정되지 않았습니다. .env.local을 확인하세요.')
}

console.log('✅ Supabase URL 확인됨:', supabaseUrl?.slice(0, 30) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)