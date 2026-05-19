import Link from 'next/link'
import { Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Music className="h-6 w-6" />
            MOVEMENT
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/lessons">שיעורים</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/me/bookings">ההזמנות שלי</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/lessons">הזמינו מקום</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MOVEMENT – כל הזכויות שמורות</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/terms" className="hover:text-foreground transition-colors">תנאי שימוש</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">פרטיות</Link>
        </div>
      </footer>
    </>
  )
}
