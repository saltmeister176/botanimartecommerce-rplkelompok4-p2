import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  // FIX #2: Cek apakah user adalah admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true

  const body = await req.json()
  const { payment_status, status, payment_proof_url } = body

  const validPaymentStatuses = ['unpaid', 'paid', 'failed', 'refunded']
  const validOrderStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled']

  // Validasi input
  if (payment_status && !validPaymentStatuses.includes(payment_status)) {
    return NextResponse.json({ error: 'Invalid payment_status' }, { status: 400 })
  }
  if (status && !validOrderStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // FIX #2: Admin boleh update order siapapun, user biasa hanya punya sendiri
  const orderQuery = supabase
    .from('orders')
    .select('id, user_id')
    .eq('id', id)

  if (!isAdmin) {
    orderQuery.eq('user_id', user.id)
  }

  const { data: order, error: findError } = await orderQuery.single()

  if (findError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Susun update object
  const updates: Record<string, any> = {}
  if (payment_status) {
    updates.payment_status = payment_status
    // Auto-update status order kalau payment dikonfirmasi
    if (payment_status === 'paid') updates.status = 'processing'
  }
  // FIX #2: Admin bisa update status order secara eksplisit
  if (status && isAdmin) {
    updates.status = status
  }
  // FIX #3: Simpan URL bukti bayar
  if (payment_proof_url) {
    updates.payment_proof_url = payment_proof_url
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}