import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, statusLabels } from '@/lib/format'
import type { Lesson, BookingStatus } from '@/types/database'

const statusVariant: Record<BookingStatus, 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' | 'default'> = {
  confirmed: 'success',
  pending_payment: 'warning',
  cancelled: 'destructive',
  attended: 'secondary',
  no_show: 'outline',
}

export default async function RosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [lessonResult, bookingsResult] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', id).single(),
    supabase
      .from('bookings')
      .select('*, users(name, phone, email)')
      .eq('lesson_id', id)
      .order('created_at'),
  ])

  const lesson = lessonResult.data as unknown as Lesson | null
  const bookings = bookingsResult.data

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">נוכחות – {lesson?.title ?? ''}</h1>
      <p className="text-muted-foreground mb-8">{formatDate(lesson?.date ?? '')}</p>

      <div className="space-y-3">
        {(bookings ?? []).map((booking: Record<string, unknown>) => {
          const student = booking.users as { name: string; phone: string; email: string | null } | null
          const status = booking.status as BookingStatus

          return (
            <Card key={booking.id as string}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student?.name}</p>
                    <p className="text-sm text-muted-foreground">{student?.phone}</p>
                  </div>
                  <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(!bookings || bookings.length === 0) && (
          <p className="text-center text-muted-foreground py-10">אין נרשמות לשיעור זה</p>
        )}
      </div>
    </div>
  )
}
