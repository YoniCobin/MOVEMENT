import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatTime, formatPrice, levelLabels, statusLabels } from '@/lib/format'
import { Plus, Edit2 } from 'lucide-react'
import type { LessonStatus } from '@/types/database'

const statusVariant: Record<LessonStatus, 'success' | 'destructive' | 'secondary' | 'outline'> = {
  open: 'success',
  full: 'secondary',
  cancelled: 'destructive',
  completed: 'outline',
}

export default async function AdminLessonsPage() {
  const supabase = await createClient()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, bookings(count)')
    .order('date', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ניהול שיעורים</h1>
        <Button asChild>
          <Link href="/admin/lessons/new">
            <Plus className="h-4 w-4 ml-1" />
            שיעור חדש
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {(lessons ?? []).map((lesson: Record<string, unknown>) => {
          const bookingCount = (lesson.bookings as { count: number }[] | null)?.[0]?.count ?? 0
          const status = lesson.status as LessonStatus

          return (
            <Card key={lesson.id as string}>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{lesson.title as string}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(lesson.date as string)} • {formatTime(lesson.start_time as string)} •{' '}
                      {levelLabels[lesson.level as string]} • {formatPrice(lesson.price as number)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bookingCount}/{lesson.max_students as number} נרשמות
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/lessons/${lesson.id as string}/edit`}>
                        <Edit2 className="h-3 w-3 ml-1" />
                        עריכה
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/lessons/${lesson.id as string}/roster`}>
                        נוכחות
                      </Link>
                    </Button>
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
