import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET - fetch reviews for a product
export async function GET(req: Request) {
const supabase = await createClient()   // ← just this
  const { searchParams } = new URL(req.url)
  const product_id = searchParams.get('product_id')

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name)')
    .eq('product_id', product_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST - submit a review
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { product_id, rating, comment } = await req.json()

  if (!product_id || !rating) {
    return NextResponse.json({ error: 'product_id and rating are required' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You already reviewed this product' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: user.id, product_id, rating, comment })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}