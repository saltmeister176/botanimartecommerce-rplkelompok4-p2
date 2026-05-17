// ============================================================
// lib/utils.ts
// Helper functions & static config — dipindah dari mockData.ts
// ============================================================

export type OrderStatus =
  | 'pending'
  | 'payment_verification'
  | 'processing'
  | 'shipping'
  | 'completed'
  | 'cancelled'

export interface PaymentMethod {
  id: string
  type: 'qris' | 'bank_transfer'
  name: string
  details?: string
}

// ── Format Helpers ───────────────────────────────────────────

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// ── Order Status Helpers ─────────────────────────────────────

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':              return 'bg-muted text-muted-foreground'
    case 'payment_verification': return 'bg-accent/50 text-accent-foreground'
    case 'processing':           return 'bg-blue-100 text-blue-700'
    case 'shipping':             return 'bg-purple-100 text-purple-700'
    case 'completed':            return 'bg-secondary/10 text-secondary'
    case 'cancelled':            return 'bg-destructive/10 text-destructive'
    default:                     return 'bg-muted text-muted-foreground'
  }
}

export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':              return 'Pending Payment'
    case 'payment_verification': return 'Verifying Payment'
    case 'processing':           return 'Processing'
    case 'shipping':             return 'Shipping'
    case 'completed':            return 'Completed'
    case 'cancelled':            return 'Cancelled'
    default:                     return status
  }
}

// ── Static Config ────────────────────────────────────────────

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'qris',
    type: 'qris',
    name: 'QRIS',
    details: 'Scan QR code to pay',
  },
  {
    id: 'bca',
    type: 'bank_transfer',
    name: 'Bank BCA',
    details: '1234567890 a.n. Botani Mart',
  },
  {
    id: 'mandiri',
    type: 'bank_transfer',
    name: 'Bank Mandiri',
    details: '9876543210 a.n. Botani Mart',
  },
]
