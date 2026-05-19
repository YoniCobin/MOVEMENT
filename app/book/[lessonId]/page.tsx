'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  phone: z.string().regex(/^0[5-9]\d{8}$/, 'מספר טלפון לא תקין'),
  email: z.string().email('אימייל לא תקין').or(z.literal('')),
})

type FormData = z.infer<typeof schema>

type Step = 'details' | 'otp' | 'processing' | 'waitlisted'

export default function BookPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const router = useRouter()

  const [step, setStep] = useState<Step>('details')
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [formData, setFormData] = useState<FormData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onDetails(data: FormData) {
    setLoading(true)
    setError('')
    setFormData(data)

    const supabase = createClient()
    const normalized = data.phone.replace(/^0/, '+972')
    setPhone(normalized)

    const { error } = await supabase.auth.signInWithOtp({ phone: normalized })
    if (error) {
      setError('שגיאה בשליחת ה-SMS. נסי שוב.')
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  async function verifyAndBook() {
    if (!formData) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: otpError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })

    if (otpError) {
      setError('קוד שגוי. נסי שוב.')
      setLoading(false)
      return
    }

    setStep('processing')

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, ...formData }),
    })

    const result = await res.json()

    if (!res.ok) {
      setError(result.error ?? 'שגיאה ביצירת ההזמנה')
      setStep('otp')
    } else if (result.status === 'waitlisted') {
      setStep('waitlisted')
    } else if (result.paymentUrl) {
      window.location.href = result.paymentUrl
    }
    setLoading(false)
  }

  if (step === 'waitlisted') {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="text-5xl mb-6">📋</div>
        <h1 className="text-2xl font-bold mb-4">הצטרפת לרשימת ההמתנה!</h1>
        <p className="text-muted-foreground mb-8">נשלח לך SMS ברגע שיתפנה מקום.</p>
        <Button asChild><a href="/lessons">לשיעורים אחרים</a></Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>הזמנת מקום</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'details' && (
            <form onSubmit={handleSubmit(onDetails)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input id="name" {...register('name')} placeholder="ישראל ישראלי" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input id="phone" type="tel" dir="ltr" {...register('phone')} placeholder="05XXXXXXXX" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">אימייל (אופציונלי)</Label>
                <Input id="email" type="email" dir="ltr" {...register('email')} placeholder="name@email.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'שולח קוד...' : 'המשך לאימות'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                שלחנו קוד אימות לטלפון שלך
              </p>
              <div className="space-y-2">
                <Label htmlFor="otp">קוד אימות (6 ספרות)</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  dir="ltr"
                  className="text-center text-xl tracking-widest"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={verifyAndBook} disabled={loading || otp.length < 6}>
                {loading ? 'מעבד...' : 'אישור ומעבר לתשלום'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('details')}>
                חזרה
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center text-muted-foreground">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p>מעביר לדף התשלום...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
