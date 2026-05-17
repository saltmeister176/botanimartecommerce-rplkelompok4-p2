import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET - fetch current user's cart
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  // Ambil cart items dulu
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!cartItems || cartItems.length === 0) return NextResponse.json([])

  // Ambil product detail secara manual (in case FK belum terdefinisi di DB)
  const productIds = cartItems.map((item: any) => item.product_id)
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, name, price, image_url, stock, category_id')
    .in('id', productIds)

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 })

  // Gabungkan manual
  const productMap = Object.fromEntries((products ?? []).map((p: any) => [p.id, p]))
  const result = cartItems.map((item: any) => ({
    ...item,
    products: productMap[item.product_id] ?? null,
  }))

  return NextResponse.json(result)
}

// POST - add item to cart
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { product_id, quantity } = await req.json()

  if (!product_id || !quantity) {
    return NextResponse.json({ error: 'product_id and quantity are required' }, { status: 400 })
  }

  // Jika produk sudah ada di cart, tambah quantity
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

// PATCH - update quantity item tertentu
export async function PATCH(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { cart_item_id, quantity } = await req.json()

  if (!cart_item_id || quantity === undefined) {
    return NextResponse.json({ error: 'cart_item_id and quantity are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cart_item_id)
    .eq('user_id', user.id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// DELETE - remove item dari cart
export async function DELETE(req: Request) {
  const supabase = await createClient()

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