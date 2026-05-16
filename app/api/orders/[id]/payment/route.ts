import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { payment_status } = await req.json()

  const validStatuses = ['unpaid', 'paid', 'failed', 'refunded']
  if (!validStatuses.includes(payment_status)) {
    return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
  }

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (findError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status,
      status: payment_status === 'paid' ? 'processing' : 'pending'
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}