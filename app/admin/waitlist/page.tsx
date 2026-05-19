import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/format'

export default async function AdminWaitlistPage() {
  const supabase = await createClient()

  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*, users(name, phone), lessons(title, date, start_time)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">רשימות המתנה</h1>
      <div className="space-y-3">
        {(waitlist ?? []).map((entry: Record<string, unknown>) => {
          const student = entry.users as { name: string; phone: string } | null
          const lesson = entry.lessons as { title: string; date: string; start_time: string } | null
          const notified = !!entry.notified_at

          return (
            <Card key={entry.id as string}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student?.name} <span className="text-muted-foreground font-normal text-sm">#{entry.position as number}</span></p>
                    <p className="text-sm text-muted-foreground">{student?.phone}</p>
                    <p className="text-sm text-muted-foreground">{lesson?.title} • {formatDate(lesson?.date ?? '')} {formatTime(lesson?.start_time ?? '')}</p>
                  </div>
                  <Badge variant={notified ? 'warning' : 'secondary'}>
                    {notified ? 'יודעה' : 'ממתינה'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(!waitlist || waitlist.length === 0) && (
          <p className="text-center text-muted-foreground py-10">אין כרגע נרשמות ברשימות המתנה</p>
        )}
      </div>
    </div>
  )
}
