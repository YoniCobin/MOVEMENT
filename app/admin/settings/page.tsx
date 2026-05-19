import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">הגדרות</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>תבניות SMS</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">הגדרת תבניות SMS תגיע בקרוב</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>מדיניות ביטולים</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">הגדרות מדיניות ביטולים יגיעו בקרוב</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>סף "מעט מקומות"</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">כרגע: 3 מקומות ומטה = התראה</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
