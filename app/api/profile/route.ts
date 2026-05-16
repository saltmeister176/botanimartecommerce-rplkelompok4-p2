import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET - fetch current user's profile
export async function GET() {
const supabase = await createClient()   // ← just this
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// PATCH - update current user's profile
export async function PATCH(req: Request) {
const supabase = await createClient()   // ← just this
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { name, phone_number } = await req.json()

  const { data, error } = await supabase
    .from('profiles')
    .update({ name, phone_number })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}