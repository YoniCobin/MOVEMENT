import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Calendar, Users, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatTime, formatDuration, formatPrice, levelLabels } from '@/lib/format'
import type { LessonWithAvailability } from '@/types/database'

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lessons } = await supabase.rpc('get_lessons_with_availability')
  const lesson = (lessons as LessonWithAvailability[] | null)?.find((l) => l.id === id)

  if (!lesson) notFound()

  const isFull = lesson.seats_left === 0
  const isLowStock = !isFull && lesson.seats_left <= 3

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/lessons" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" />
        חזרה לשיעורים
      </Link>

      {lesson.cover_image_url && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src={lesson.cover_image_url} alt={lesson.title} className="w-full h-64 object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <div className="mt-2 flex gap-2">
            <Badge variant="secondary">{levelLabels[lesson.level]}</Badge>
            {isFull && <Badge variant="destructive">אזל</Badge>}
          </div>
        </div>
        <div className="text-3xl font-black text-primary">{formatPrice(lesson.price)}</div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-medium">תאריך</div>
              <div className="text-muted-foreground">{formatDate(lesson.date)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-medium">שעה ומשך</div>
              <div className="text-muted-foreground">
                {formatTime(lesson.start_time)} • {formatDuration(lesson.duration_min)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-medium">מיקום</div>
              <div className="text-muted-foreground">
                {lesson.location_url ? (
                  <a href={lesson.location_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                    {lesson.location}
                  </a>
                ) : (
                  lesson.location
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-medium">מקומות</div>
              <div className={`text-muted-foreground ${isLowStock ? 'text-amber-600 font-medium' : ''} ${isFull ? 'text-destructive font-medium' : ''}`}>
                {isFull ? 'אזל – ניתן להצטרף לרשימת המתנה' : `${lesson.seats_left} מקומות פנויים`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {lesson.description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">על השיעור</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{lesson.description}</p>
        </div>
      )}

      <Separator className="mb-8" />

      <div className="flex justify-center">
        <Button asChild size="lg" className="w-full max-w-sm" variant={isFull ? 'outline' : 'default'}>
          <Link href={`/book/${lesson.id}`}>
            {isFull ? 'הצטרפו לרשימת המתנה' : 'הזמינו מקום עכשיו'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
