export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatTime, formatPrice, statusLabels } from '@/lib/format'
import type { BookingWithLesson, BookingStatus } from '@/types/database'

const statusVariant: Record<BookingStatus, 'default' | 'success' | 'destructive' | 'warning' | 'outline' | 'secondary'> = {
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
  attended: 'secondary',
  no_show: 'outline',
}

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, lessons(*), payments(status, green_invoice_doc_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const upcoming = bookings?.filter((b: BookingWithLesson) =>
    ['confirmed', 'pending_payment'].includes(b.status) &&
    new Date(b.lesson.date) >= new Date()
  ) ?? []

  const past = bookings?.filter((b: BookingWithLesson) =>
    !upcoming.includes(b)
  ) ?? []

  function BookingRow({ booking }: { booking: Record<string, unknown> }) {
    const lesson = booking.lessons as { title: string; date: string; start_time: string; price: number; location: string }
    const status = booking.status as BookingStatus
    const payment = (booking.payments as { status: string; green_invoice_doc_url: string | null } | null)

    return (
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{lesson.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(lesson.date)} • {formatTime(lesson.start_time)} • {lesson.location}
              </p>
              <p className="text-sm font-medium mt-1">{formatPrice(lesson.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
              {payment?.green_invoice_doc_url && (
                <Button asChild variant="outline" size="sm">
                  <a href={payment.green_invoice_doc_url} target="_blank" rel="noopener noreferrer">
                    קבלה
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">ההזמנות שלי</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">הזמנות קרובות</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>אין הזמנות קרובות</p>
            <Button asChild className="mt-4"><Link href="/lessons">בחרי שיעור</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b: BookingWithLesson) => (
              <BookingRow key={b.id} booking={b as unknown as Record<string, unknown>} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">היסטוריה</h2>
          <div className="space-y-3">
            {past.map((b: BookingWithLesson) => (
              <BookingRow key={b.id} booking={b as unknown as Record<string, unknown>} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
