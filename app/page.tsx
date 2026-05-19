import Link from 'next/link'
import { ArrowLeft, Star, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="font-bold text-xl text-primary">MOVEMENT</span>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/lessons">שיעורים</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/me/bookings">ההזמנות שלי</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/lessons">הזמינו עכשיו</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent to-background py-24 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
              תרקדו איתנו
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              שיעורי ריקוד לכל הרמות – הזמינו מקום בקלות, שלמו מקוון ובואו לרקוד.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/lessons">
                  לכל השיעורים
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#about">על המורה</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-muted/50 py-12">
          <div className="container mx-auto grid grid-cols-3 gap-8 px-4 text-center">
            <div>
              <div className="text-3xl font-black text-primary">200+</div>
              <div className="text-sm text-muted-foreground mt-1">תלמידות מאושרות</div>
            </div>
            <div>
              <div className="text-3xl font-black text-primary">5★</div>
              <div className="text-sm text-muted-foreground mt-1">דירוג ממוצע</div>
            </div>
            <div>
              <div className="text-3xl font-black text-primary">8 שנים</div>
              <div className="text-sm text-muted-foreground mt-1">ניסיון הוראה</div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">על המורה</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                מורה לריקוד עם ניסיון של מעל 8 שנים בהוראה. מתמחה בריקודים לטיניים,
                היפ הופ ומחול עכשווי. שיעורים בסביבה תומכת ומכילה לכל הרמות.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">למה לבחור בנו?</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold">הוראה איכותית</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    שיעורים מותאמים לכל רמה עם משוב אישי
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold">קבוצות קטנות</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    עד 12 תלמידות לשיעור לחוויה אישית
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold">גמישות בלוח</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    שיעורים בבוקר, בצהריים ובערב
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">מה אומרות התלמידות</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'מיכל כ.', text: 'שיעורים מדהימים! המורה סבלנית ומקצועית. הרגשתי שהתקדמתי כבר מהשיעור הראשון.' },
                { name: 'רחל ל.', text: 'האווירה הכי טובה שיש. כיף לבוא לכל שיעור ולרקוד עם קבוצה נהדרת.' },
                { name: 'נועה ב.', text: 'ממליצה בחום! המחירים הוגנים, ההזמנה הכי קלה ותמיד מקבלים תזכורת.' },
              ].map((t) => (
                <Card key={t.name}>
                  <CardContent className="pt-6">
                    <div className="flex text-amber-400 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    <p className="mt-4 font-semibold text-sm">{t.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-20 text-center text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold">מוכנות להתחיל?</h2>
            <p className="mt-4 text-primary-foreground/80">הצטרפו לקבוצות שלנו עוד היום</p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href="/lessons">בחרו שיעור עכשיו</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MOVEMENT – כל הזכויות שמורות</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/terms" className="hover:text-foreground transition-colors">תנאי שימוש</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">פרטיות</Link>
        </div>
      </footer>
    </>
  )
}
