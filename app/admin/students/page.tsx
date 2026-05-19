import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatPrice } from '@/lib/format'

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('users')
    .select('*, bookings(id, status, payments(amount, status))')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">תלמידות ({students?.length ?? 0})</h1>
      <div className="space-y-3">
        {(students ?? []).map((student: Record<string, unknown>) => {
          const bookings = student.bookings as { status: string; payments: { amount: number; status: string } | null }[] | null
          const totalPaid = bookings?.reduce((sum, b) => {
            if (b.payments?.status === 'paid') return sum + Number(b.payments.amount)
            return sum
          }, 0) ?? 0
          const confirmedCount = bookings?.filter((b) => b.status === 'confirmed' || b.status === 'attended').length ?? 0

          return (
            <Card key={student.id as string}>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{student.name as string}</h3>
                    <p className="text-sm text-muted-foreground">
                      {student.phone as string}
                      {student.email ? ` • ${student.email as string}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      נרשמה: {formatDate(student.created_at as string)} •{' '}
                      {confirmedCount} שיעורים
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-primary">{formatPrice(totalPaid)}</p>
                    <p className="text-xs text-muted-foreground">סה"כ שילמה</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
