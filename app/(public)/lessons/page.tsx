import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LessonCard } from '@/components/lesson-card'
import type { LessonWithAvailability } from '@/types/database'

export const revalidate = 60

async function LessonsList({ level }: { level?: string }) {
  const supabase = await createClient()
  const { data: lessons } = await supabase.rpc('get_lessons_with_availability')

  const filtered = level
    ? (lessons ?? []).filter((l: LessonWithAvailability) => l.level === level)
    : lessons ?? []

  if (filtered.length === 0) {
    return (
      <div className="col-span-full py-16 text-center text-muted-foreground">
        אין שיעורים פתוחים כרגע. חזרו בקרוב!
      </div>
    )
  }

  return (
    <>
      {(filtered as LessonWithAvailability[]).map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </>
  )
}

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const { level } = await searchParams

  const levels = [
    { value: '', label: 'כל הרמות' },
    { value: 'beginner', label: 'מתחילים' },
    { value: 'intermediate', label: 'בינוניים' },
    { value: 'advanced', label: 'מתקדמים' },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">השיעורים הקרובים</h1>
        <p className="mt-2 text-muted-foreground">הזמינו מקום בקלות ושלמו מקוון</p>
      </div>

      {/* Level filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {levels.map(({ value, label }) => (
          <a
            key={value}
            href={value ? `/lessons?level=${value}` : '/lessons'}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              level === value || (!level && !value)
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense
          fallback={Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        >
          <LessonsList level={level} />
        </Suspense>
      </div>
    </div>
  )
}
