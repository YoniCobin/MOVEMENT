import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react'
import { formatPrice, formatDate, formatTime } from '@/lib/format'

export const revalidate = 30

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalStudents },
    { data: monthPayments },
    { data: nextLessons },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', monthStart),
    supabase
      .from('lessons')
      .select('*, bookings(count)')
      .in('status', ['open', 'full'])
      .gte('date', now.toISOString().split('T')[0])
      .order('date')
      .limit(5),
    supabase
      .from('bookings')
      .select('*, users(name), lessons(title, date)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const monthRevenue = monthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  const kpis = [
    { label: 'הכנסות החודש', value: formatPrice(monthRevenue), icon: DollarSign, color: 'text-green-600' },
    { label: 'סה"כ תלמידות', value: totalStudents ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'שיעורים קרובים', value: nextLessons?.length ?? 0, icon: Calendar, color: 'text-primary' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">לוח בקרה</h1>

      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-black mt-1">{value}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>שיעורים קרובים</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(nextLessons ?? []).map((lesson: Record<string, unknown>) => {
                const bookingCount = (lesson.bookings as { count: number }[] | null)?.[0]?.count ?? 0
                return (
                  <div key={lesson.id as string} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{lesson.title as string}</span>
                      <span className="text-muted-foreground mr-2">
                        {formatDate(lesson.date as string)} {formatTime(lesson.start_time as string)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{bookingCount}/{lesson.max_students as number}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>הזמנות אחרונות</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentBookings ?? []).map((booking: Record<string, unknown>) => {
                const student = booking.users as { name: string } | null
                const lesson = booking.lessons as { title: string; date: string } | null
                return (
                  <div key={booking.id as string} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{student?.name}</span>
                      <span className="text-muted-foreground mr-2">{lesson?.title}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">{formatDate(lesson?.date ?? '')}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
