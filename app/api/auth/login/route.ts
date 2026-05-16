import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()

  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return NextResponse.json({ error: error.message }, { status: 401 })

  return NextResponse.json({
    message: 'Logged in successfully',
    user: { id: data.user.id, email: data.user.email }
  })
}