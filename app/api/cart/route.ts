import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - fetch current user's cart
export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(name, price, image_url)')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST - add item to cart
export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { product_id, quantity } = await req.json()

  // If item already in cart, increase quantity
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({ user_id: user.id, product_id, quantity })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

// DELETE - remove item from cart
export async function DELETE(req: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { cart_item_id } = await req.json()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cart_item_id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: 'Item removed' })
}