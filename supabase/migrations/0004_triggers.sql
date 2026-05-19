-- Auto-update lesson status when bookings change
CREATE OR REPLACE FUNCTION update_lesson_status()
RETURNS trigger AS $$
DECLARE
  v_booked int;
  v_max int;
  v_new_status lesson_status;
BEGIN
  SELECT COUNT(*), l.max_students
  INTO v_booked, v_max
  FROM bookings b
  JOIN lessons l ON l.id = b.lesson_id
  WHERE b.lesson_id = COALESCE(NEW.lesson_id, OLD.lesson_id)
    AND b.status IN ('confirmed', 'pending_payment')
  GROUP BY l.max_students;

  IF v_booked >= v_max THEN
    v_new_status := 'full';
  ELSE
    SELECT status INTO v_new_status FROM lessons
    WHERE id = COALESCE(NEW.lesson_id, OLD.lesson_id);
    IF v_new_status = 'full' THEN
      v_new_status := 'open';
    END IF;
  END IF;

  UPDATE lessons SET status = v_new_status
  WHERE id = COALESCE(NEW.lesson_id, OLD.lesson_id)
    AND status NOT IN ('cancelled', 'completed');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_status_change
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_lesson_status();

-- Promote first person on waitlist when a spot opens
CREATE OR REPLACE FUNCTION promote_waitlist_on_cancel()
RETURNS trigger AS $$
DECLARE
  v_first waitlist%ROWTYPE;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT * INTO v_first
    FROM waitlist
    WHERE lesson_id = NEW.lesson_id AND notified_at IS NULL
    ORDER BY position ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE waitlist
      SET notified_at = now(),
          notification_expires_at = now() + INTERVAL '12 hours'
      WHERE id = v_first.id;

      -- Edge Function will pick this up and send SMS
      PERFORM pg_notify('waitlist_promoted', json_build_object(
        'waitlist_id', v_first.id,
        'lesson_id', NEW.lesson_id,
        'user_id', v_first.user_id
      )::text);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_promote_waitlist
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION promote_waitlist_on_cancel();

-- Trigger Edge Function on lesson cancellation (notify all bookings)
CREATE OR REPLACE FUNCTION notify_lesson_cancelled()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM pg_notify('lesson_cancelled', json_build_object(
      'lesson_id', NEW.id
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lesson_cancelled
  AFTER UPDATE OF status ON lessons
  FOR EACH ROW EXECUTE FUNCTION notify_lesson_cancelled();
