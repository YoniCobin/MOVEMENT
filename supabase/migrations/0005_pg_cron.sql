-- Enable pg_cron extension (run once on Supabase dashboard if needed)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Reminders: check every hour for lessons 23-24h away
SELECT cron.schedule(
  'send-24h-reminders',
  '0 * * * *',
  $$
    UPDATE bookings b
    SET reminder_sent_at = now()
    FROM lessons l
    WHERE b.lesson_id = l.id
      AND b.status = 'confirmed'
      AND b.reminder_sent_at IS NULL
      AND (l.date + l.start_time) BETWEEN (now() + INTERVAL '23 hours') AND (now() + INTERVAL '24 hours');
    -- Note: actual SMS sending is done by Edge Function via Supabase Realtime / polling
  $$
);

-- Feedback requests: check every hour, 3h after lesson end
SELECT cron.schedule(
  'send-feedback-requests',
  '30 * * * *',
  $$
    UPDATE bookings b
    SET feedback_request_sent_at = now()
    FROM lessons l
    WHERE b.lesson_id = l.id
      AND b.status IN ('confirmed', 'attended')
      AND b.feedback_request_sent_at IS NULL
      AND (l.date + l.start_time + (l.duration_min || ' minutes')::interval)
          < (now() - INTERVAL '3 hours')
      AND (l.date + l.start_time + (l.duration_min || ' minutes')::interval)
          > (now() - INTERVAL '24 hours');
  $$
);

-- Mark no-shows: 24h after lesson, confirmed bookings with no attendance mark
SELECT cron.schedule(
  'mark-no-shows',
  '0 2 * * *',
  $$
    UPDATE bookings b
    SET status = 'no_show'
    FROM lessons l
    WHERE b.lesson_id = l.id
      AND b.status = 'confirmed'
      AND (l.date + l.start_time) < (now() - INTERVAL '24 hours');
  $$
);
