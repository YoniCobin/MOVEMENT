'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function FeedbackPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function submit() {
    if (!rating) return
    setLoading(true)
    setError('')

    const { error } = await supabase.from('feedback').insert({
      booking_id: bookingId,
      rating,
      comment: comment || null,
    })

    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-6xl mb-6">🙏</div>
          <h1 className="text-2xl font-bold mb-3">תודה על המשוב!</h1>
          <p className="text-muted-foreground mb-8">זה עוזר לנו להשתפר ולהגיש לכן שיעורים טובים יותר.</p>
          <Button asChild><Link href="/lessons">לשיעורים הבאים</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>איך היה השיעור?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hovered || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <textarea
              className="w-full rounded-lg border border-input bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
              placeholder="ספרי לנו עוד (אופציונלי)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" onClick={submit} disabled={!rating || loading}>
            {loading ? 'שולחת...' : 'שלחי משוב'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
