'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

// Use strings for number fields – HTML inputs always return strings
const schema = z.object({
  title: z.string().min(2, 'שם חובה'),
  description: z.string().optional(),
  date: z.string().min(1, 'תאריך חובה'),
  start_time: z.string().min(1, 'שעה חובה'),
  duration_min: z.string().min(1),
  location: z.string().min(2, 'מיקום חובה'),
  location_url: z.string().optional(),
  max_students: z.string().min(1),
  price: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
})

type FormData = z.infer<typeof schema>

export default function NewLessonPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { duration_min: '60', max_students: '12', level: 'beginner' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')

    const { error } = await supabase.from('lessons').insert({
      title: data.title,
      description: data.description || null,
      date: data.date,
      start_time: data.start_time,
      duration_min: Number(data.duration_min),
      location: data.location,
      location_url: data.location_url || null,
      max_students: Number(data.max_students),
      price: Number(data.price),
      level: data.level,
      status: 'open',
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/admin/lessons')
    }
    setLoading(false)
  }

  type FieldConfig = { id: keyof FormData; label: string; type?: string }
  const fields: FieldConfig[] = [
    { id: 'title', label: 'שם השיעור' },
    { id: 'date', label: 'תאריך', type: 'date' },
    { id: 'start_time', label: 'שעת התחלה', type: 'time' },
    { id: 'duration_min', label: 'משך (דקות)', type: 'number' },
    { id: 'location', label: 'מיקום' },
    { id: 'location_url', label: 'קישור למפה (אופציונלי)', type: 'url' },
    { id: 'max_students', label: 'מקסימום משתתפות', type: 'number' },
    { id: 'price', label: 'מחיר (₪)', type: 'number' },
  ]

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">שיעור חדש</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map(({ id, label, type = 'text' }) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  type={type}
                  {...register(id)}
                  dir={['url', 'number', 'date', 'time'].includes(type) ? 'ltr' : 'rtl'}
                />
                {errors[id] && <p className="text-sm text-destructive">{errors[id]?.message}</p>}
              </div>
            ))}

            <div className="space-y-1">
              <Label htmlFor="level">רמה</Label>
              <select
                id="level"
                {...register('level')}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="beginner">מתחילים</option>
                <option value="intermediate">בינוניים</option>
                <option value="advanced">מתקדמים</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">תיאור (אופציונלי)</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'שומר...' : 'צור שיעור'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                ביטול
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
