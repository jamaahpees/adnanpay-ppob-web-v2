import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Receipt,
  LogOut
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/produk', label: 'Produk', icon: Package },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/transaksi', label: 'Transaksi', icon: Receipt },
]

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
      </div>
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors w-full text-left text-destructive">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  )
}
