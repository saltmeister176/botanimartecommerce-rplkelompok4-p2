import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmailNotification, sendWhatsAppNotification } from 'lib/notifications'

// GET - fetch orders (admin: semua order, user biasa: punya sendiri)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  // FIX #1: Cek apakah user adalah admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true

// Admin lihat semua order, biasa lihat punya sendiri
let query = supabase
  .from('orders')
  .select('*, order_items(*, products(name, image_url))')
  .order('created_at', { ascending: false })

if (!isAdmin) {
  query = query.eq('user_id', user.id)
}

const { data, error } = await query
if (error) return NextResponse.json({ error: error.message }, { status: 500 })

return NextResponse.json(data)
}

// POST - place an order from current cart
export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('*, products(price, stock)')
    .eq('user_id', user.id)

  if (cartError) return NextResponse.json({ error: cartError.message }, { status: 500 })
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Check stock availability before placing order
  for (const item of cartItems) {
    if (item.products.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stok ${item.products.name} tidak mencukupi` },
        { status: 400 }
      )
    }
  }

  const total = cartItems.reduce((sum: number, item: any) => {
    return sum + item.products.price * item.quantity
  }, 0)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: user.id, total, status: 'pending', payment_status: 'unpaid' })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const orderItems = cartItems.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.products.price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  await supabase.from('cart_items').delete().eq('user_id', user.id)

  // Send notifications
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('name, email, phone_number')
    .eq('id', user.id)
    .single()

  if (userProfile) {
    const message = `Hi ${userProfile.name}! Your BotaniMart order has been placed. Total: Rp ${total.toLocaleString('id-ID')}.`
    try {
      await sendEmailNotification({ to: userProfile.email, subject: 'Order Confirmed!', message })
    } catch (e) {
      console.error('Email notification failed:', e)
    }
    if (userProfile.phone_number) {
      try {
        await sendWhatsAppNotification({ phone: userProfile.phone_number, message })
      } catch (e) {
        console.error('WhatsApp notification failed:', e)
      }
    }
  }

  return NextResponse.json(order, { status: 201 })
}