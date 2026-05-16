export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    description: string;
    rating: number;
    reviewCount: number;
    isNew?: boolean;
    isRecommended?: boolean;
  }
  
  export interface Category {
    id: string;
    name: string;
    icon: string;
  }
  
  export interface CartItem {
    product: Product;
    quantity: number;
  }
  
  export interface PaymentMethod {
    id: string;
    type: 'qris' | 'bank_transfer';
    name: string;
    details?: string;
  }
  
  export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    products: CartItem[];
    subtotal: number;
    shippingCost: number;
    total: number;
    status: 'pending' | 'payment_verification' | 'processing' | 'shipping' | 'completed' | 'cancelled';
    paymentMethod: string;
    paymentProof?: string;
    shippingMethod: 'delivery' | 'pickup';
    date: string;
    notes?: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'store_manager' | 'admin';
    isActive: boolean;
    createdAt: string;
  }
  
  export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    details: string;
  }
  
  export const categories: Category[] = [
    { id: '1', name: 'Plants', icon: 'plant' },
    { id: '2', name: 'Seeds', icon: 'seed' },
    { id: '3', name: 'Tools', icon: 'wrench' },
    { id: '4', name: 'Fertilizers', icon: 'flask' },
  ];
  
  export const products: Product[] = [
    {
      id: '1',
      name: 'Tomato Seeds Premium',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=400&fit=crop',
      category: 'Seeds',
      stock: 50,
      description: 'High-quality tomato seeds for optimal harvest. Suitable for tropical climate. These premium seeds have been tested for high germination rates and disease resistance.',
      rating: 4.8,
      reviewCount: 124,
      isRecommended: true,
    },
    {
      id: '2',
      name: 'Monstera Deliciosa',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
      category: 'Plants',
      stock: 15,
      description: 'Beautiful tropical plant perfect for indoor decoration. Easy to care for and grows well in indirect sunlight.',
      rating: 4.9,
      reviewCount: 89,
      isNew: true,
      isRecommended: true,
    },
    {
      id: '3',
      name: 'Garden Pruning Shears',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      category: 'Tools',
      stock: 30,
      description: 'Professional-grade pruning shears with ergonomic handle. Made from high-carbon steel for durability.',
      rating: 4.7,
      reviewCount: 56,
    },
    {
      id: '4',
      name: 'Organic Fertilizer 5kg',
      price: 75000,
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop',
      category: 'Fertilizers',
      stock: 100,
      description: '100% organic fertilizer for healthier plants and soil. Rich in nutrients and eco-friendly.',
      rating: 4.6,
      reviewCount: 203,
      isRecommended: true,
    },
    {
      id: '5',
      name: 'Chili Seeds Mix',
      price: 30000,
      image: 'https://images.unsplash.com/photo-1583573607873-3fbbdcdb9c8f?w=400&h=400&fit=crop',
      category: 'Seeds',
      stock: 75,
      description: 'Mix of various chili seeds for spice lovers. Includes red chili, green chili, and bird\'s eye chili varieties.',
      rating: 4.5,
      reviewCount: 92,
      isNew: true,
    },
    {
      id: '6',
      name: 'Snake Plant',
      price: 95000,
      image: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=400&h=400&fit=crop',
      category: 'Plants',
      stock: 25,
      description: 'Low-maintenance plant that purifies air naturally. Perfect for beginners and busy people.',
      rating: 4.9,
      reviewCount: 145,
      isRecommended: true,
    },
    {
      id: '7',
      name: 'Garden Shovel Set',
      price: 120000,
      image: 'https://images.unsplash.com/photo-1617606002779-51d4e93c2c2e?w=400&h=400&fit=crop',
      category: 'Tools',
      stock: 20,
      description: 'Complete shovel set for all your gardening needs. Includes 3 different sizes for various tasks.',
      rating: 4.4,
      reviewCount: 67,
    },
    {
      id: '8',
      name: 'Lettuce Seeds',
      price: 20000,
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop',
      category: 'Seeds',
      stock: 60,
      description: 'Fresh lettuce seeds for home vegetable gardens. Fast-growing variety suitable for hydroponic systems.',
      rating: 4.7,
      reviewCount: 78,
      isNew: true,
    },
  ];
  
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
  ];
  
  export const orders: Order[] = [
    {
      id: 'ORD-001',
      customerId: 'CUST-001',
      customerName: 'Budi Santoso',
      customerPhone: '+62 812-3456-7890',
      customerAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
      products: [
        { product: products[0], quantity: 2 },
        { product: products[3], quantity: 1 },
      ],
      subtotal: 125000,
      shippingCost: 15000,
      total: 140000,
      status: 'completed',
      paymentMethod: 'Bank BCA',
      shippingMethod: 'delivery',
      date: '2026-05-01T10:30:00',
    },
    {
      id: 'ORD-002',
      customerId: 'CUST-002',
      customerName: 'Siti Rahayu',
      customerPhone: '+62 813-4567-8901',
      customerAddress: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
      products: [
        { product: products[1], quantity: 1 },
        { product: products[5], quantity: 1 },
      ],
      subtotal: 245000,
      shippingCost: 15000,
      total: 260000,
      status: 'shipping',
      paymentMethod: 'QRIS',
      shippingMethod: 'delivery',
      date: '2026-05-03T14:20:00',
    },
    {
      id: 'ORD-003',
      customerId: 'CUST-003',
      customerName: 'Ahmad Hidayat',
      customerPhone: '+62 814-5678-9012',
      customerAddress: 'Jl. Thamrin No. 78, Jakarta Pusat',
      products: [{ product: products[2], quantity: 1 }],
      subtotal: 85000,
      shippingCost: 0,
      total: 85000,
      status: 'payment_verification',
      paymentMethod: 'Bank Mandiri',
      paymentProof: 'https://via.placeholder.com/400x200?text=Payment+Proof',
      shippingMethod: 'pickup',
      date: '2026-05-04T09:15:00',
    },
    {
      id: 'ORD-004',
      customerId: 'CUST-004',
      customerName: 'Dewi Lestari',
      customerPhone: '+62 815-6789-0123',
      customerAddress: 'Jl. Kuningan No. 90, Jakarta Selatan',
      products: [
        { product: products[4], quantity: 3 },
        { product: products[7], quantity: 2 },
      ],
      subtotal: 130000,
      shippingCost: 15000,
      total: 145000,
      status: 'processing',
      paymentMethod: 'QRIS',
      shippingMethod: 'delivery',
      date: '2026-05-04T16:45:00',
    },
    {
      id: 'ORD-005',
      customerId: 'CUST-005',
      customerName: 'Rudi Hartono',
      customerPhone: '+62 816-7890-1234',
      customerAddress: 'Jl. Mampang No. 12, Jakarta Selatan',
      products: [{ product: products[6], quantity: 1 }],
      subtotal: 120000,
      shippingCost: 15000,
      total: 135000,
      status: 'pending',
      paymentMethod: 'Bank BCA',
      shippingMethod: 'delivery',
      date: '2026-05-05T11:00:00',
    },
  ];
  
  export const users: User[] = [
    {
      id: 'CUST-001',
      name: 'Budi Santoso',
      email: 'budi@email.com',
      phone: '+62 812-3456-7890',
      role: 'customer',
      isActive: true,
      createdAt: '2026-01-15',
    },
    {
      id: 'CUST-002',
      name: 'Siti Rahayu',
      email: 'siti@email.com',
      phone: '+62 813-4567-8901',
      role: 'customer',
      isActive: true,
      createdAt: '2026-02-20',
    },
    {
      id: 'STORE-001',
      name: 'Manager Toko',
      email: 'manager@botanimart.com',
      phone: '+62 811-1111-1111',
      role: 'store_manager',
      isActive: true,
      createdAt: '2026-01-01',
    },
    {
      id: 'ADMIN-001',
      name: 'Admin System',
      email: 'admin@botanimart.com',
      phone: '+62 810-0000-0000',
      role: 'admin',
      isActive: true,
      createdAt: '2026-01-01',
    },
  ];
  
  export const activityLogs: ActivityLog[] = [
    {
      id: 'LOG-001',
      userId: 'ADMIN-001',
      userName: 'Admin System',
      action: 'product_create',
      timestamp: '2026-05-05T08:30:00',
      details: 'Created new product: Monstera Deliciosa',
    },
    {
      id: 'LOG-002',
      userId: 'STORE-001',
      userName: 'Manager Toko',
      action: 'order_verify',
      timestamp: '2026-05-05T09:15:00',
      details: 'Verified payment for order ORD-003',
    },
    {
      id: 'LOG-003',
      userId: 'ADMIN-001',
      userName: 'Admin System',
      action: 'user_activate',
      timestamp: '2026-05-05T10:00:00',
      details: 'Activated user: Budi Santoso',
    },
  ];
  
  export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  export const getStatusColor = (status: Order['status']): string => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'payment_verification':
        return 'bg-accent/50 text-accent-foreground';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipping':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-secondary/10 text-secondary';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  export const getStatusLabel = (status: Order['status']): string => {
    switch (status) {
      case 'pending':
        return 'Pending Payment';
      case 'payment_verification':
        return 'Verifying Payment';
      case 'processing':
        return 'Processing';
      case 'shipping':
        return 'Shipping';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };
  