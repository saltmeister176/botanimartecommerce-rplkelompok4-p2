import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { name, email, password, phone_number } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
  }

  // Create auth user
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Save extra info to profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user!.id,
      name,
      email,
      phone_number: phone_number || null,
    })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ message: 'Account created! Please check your email to confirm.' }, { status: 201 })
}