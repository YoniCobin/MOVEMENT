import Link from 'next/link'
import {
  LayoutDashboard, Calendar, Users, DollarSign,
  Clock, Settings, Music
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'לוח בקרה', icon: LayoutDashboard },
  { href: '/admin/lessons', label: 'שיעורים', icon: Calendar },
  { href: '/admin/students', label: 'תלמידות', icon: Users },
  { href: '/admin/revenue', label: 'הכנסות', icon: DollarSign },
  { href: '/admin/waitlist', label: 'רשימות המתנה', icon: Clock },
  { href: '/admin/settings', label: 'הגדרות', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-l border-border bg-card flex flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <Music className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">MOVEMENT Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← חזרה לאתר
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-muted/20">
        {children}
      </main>
    </div>
  )
}
