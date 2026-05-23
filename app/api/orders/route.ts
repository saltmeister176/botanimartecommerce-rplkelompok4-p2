import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmailNotification, sendWhatsAppNotification } from 'lib/notifications'

// GET - fetch current user's orders
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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

  // Problem 3: Check stock availability before placing order
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

  // Problem 3: Deduct stock for each product after order is created
  for (const item of cartItems) {
    const newStock = item.products.stock - item.quantity
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.product_id)

    if (stockError) {
      console.error(`Failed to update stock for product ${item.product_id}:`, stockError)
    }
  }

  await supabase.from('cart_items').delete().eq('user_id', user.id)

  // Send notifications
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, phone_number')
    .eq('id', user.id)
    .single()

  if (profile) {
    const message = `Hi ${profile.name}! Your BotaniMart order has been placed. Total: Rp ${total.toLocaleString('id-ID')}.`
    try {
      await sendEmailNotification({ to: profile.email, subject: 'Order Confirmed!', message })
    } catch (e) {
      console.error('Email notification failed:', e)
    }
    if (profile.phone_number) {
      try {
        await sendWhatsAppNotification({ phone: profile.phone_number, message })
      } catch (e) {
        console.error('WhatsApp notification failed:', e)
      }
    }
  }

  return NextResponse.json(order, { status: 201 })
}