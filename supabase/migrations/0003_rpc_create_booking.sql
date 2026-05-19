-- RPC: create booking with advisory lock to prevent overbooking
CREATE OR REPLACE FUNCTION create_booking(p_lesson_id uuid, p_user_id uuid)
RETURNS TABLE(booking_id uuid, result_status text) AS $$
DECLARE
  v_seats_left int;
  v_booking_id uuid;
BEGIN
  -- Per-lesson advisory lock (prevents race across multiple Vercel instances)
  PERFORM pg_advisory_xact_lock(hashtext('lesson:' || p_lesson_id::text));

  -- Count remaining seats
  SELECT l.max_students - COUNT(b.id)
  INTO v_seats_left
  FROM lessons l
  LEFT JOIN bookings b ON b.lesson_id = l.id
    AND b.status IN ('confirmed', 'pending_payment')
  WHERE l.id = p_lesson_id
  GROUP BY l.max_students;

  IF v_seats_left > 0 THEN
    INSERT INTO bookings (lesson_id, user_id, status)
    VALUES (p_lesson_id, p_user_id, 'pending_payment')
    RETURNING id INTO v_booking_id;

    RETURN QUERY SELECT v_booking_id, 'pending_payment'::text;
  ELSE
    -- Add to waitlist
    INSERT INTO waitlist (lesson_id, user_id, position)
    VALUES (
      p_lesson_id,
      p_user_id,
      (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist WHERE lesson_id = p_lesson_id)
    )
    ON CONFLICT (lesson_id, user_id) DO NOTHING;

    RETURN QUERY SELECT NULL::uuid, 'waitlisted'::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get lessons with seat availability
CREATE OR REPLACE FUNCTION get_lessons_with_availability()
RETURNS TABLE(
  id uuid, title text, description text, cover_image_url text,
  date date, start_time time, duration_min int, location text,
  location_url text, max_students int, price numeric, level lesson_level,
  status lesson_status, created_at timestamptz,
  booked_count bigint, seats_left bigint
) AS $$
  SELECT
    l.*,
    COALESCE(COUNT(b.id), 0) AS booked_count,
    GREATEST(0, l.max_students - COALESCE(COUNT(b.id), 0)) AS seats_left
  FROM lessons l
  LEFT JOIN bookings b ON b.lesson_id = l.id
    AND b.status IN ('confirmed', 'pending_payment')
  WHERE l.status IN ('open', 'full')
    AND l.date >= CURRENT_DATE
  GROUP BY l.id
  ORDER BY l.date ASC, l.start_time ASC;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
