import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// PATCH - update payment status of an order
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { payment_status } = await req.json()

  const validStatuses = ['unpaid', 'paid', 'failed', 'refunded']
  if (!validStatuses.includes(payment_status)) {
    return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
  }

  // Make sure this order belongs to the user
  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (findError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Update payment status and order status together
  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status,
      status: payment_status === 'paid' ? 'processing' : 'pending'
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
