import Link from 'next/link'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime, formatPrice, formatDuration, levelLabels } from '@/lib/format'
import type { LessonWithAvailability } from '@/types/database'
import { cn } from '@/lib/utils'

interface LessonCardProps {
  lesson: LessonWithAvailability
}

export function LessonCard({ lesson }: LessonCardProps) {
  const isFull = lesson.seats_left === 0
  const isLowStock = !isFull && lesson.seats_left <= 3

  return (
    <Card className={cn('flex flex-col overflow-hidden transition-shadow hover:shadow-md', isFull && 'opacity-75')}>
      {lesson.cover_image_url && (
        <div className="h-40 overflow-hidden">
          <img
            src={lesson.cover_image_url}
            alt={lesson.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="leading-snug">{lesson.title}</CardTitle>
          <Badge variant={isFull ? 'destructive' : 'secondary'}>
            {levelLabels[lesson.level]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{formatDate(lesson.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{formatTime(lesson.start_time)} • {formatDuration(lesson.duration_min)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{lesson.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0" />
          {isFull ? (
            <span className="text-destructive font-medium">אזל – רשימת המתנה פתוחה</span>
          ) : (
            <span className={isLowStock ? 'text-amber-600 font-medium' : ''}>
              {isLowStock ? `נותרו ${lesson.seats_left} מקומות בלבד!` : `${lesson.seats_left} מקומות פנויים`}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-lg font-bold text-primary">{formatPrice(lesson.price)}</span>
        <Button asChild size="sm" variant={isFull ? 'outline' : 'default'}>
          <Link href={`/lessons/${lesson.id}`}>
            {isFull ? 'רשימת המתנה' : 'הזמינו מקום'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
