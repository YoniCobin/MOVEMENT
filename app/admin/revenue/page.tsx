import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatPrice } from '@/lib/format'

export default async function AdminRevenuePage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('*, bookings(users(name), lessons(title, date))')
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })

  const total = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">דוח הכנסות</h1>
      <p className="text-3xl font-black text-primary mb-8">{formatPrice(total)} סה"כ</p>

      <div className="space-y-3">
        {(payments ?? []).map((payment: Record<string, unknown>) => {
          const booking = payment.bookings as { users: { name: string } | null; lessons: { title: string; date: string } | null } | null

          return (
            <Card key={payment.id as string}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{booking?.lessons?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking?.users?.name} • {formatDate(booking?.lessons?.date ?? '')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      שולם: {formatDate(payment.paid_at as string)}
                    </p>
                  </div>
                  <p className="font-bold text-lg">{formatPrice(payment.amount as number)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
