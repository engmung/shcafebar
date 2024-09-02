import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const userReservations = db
    .prepare(
      `
    SELECT r.*, m1.name as menu_name, m2.name as drink_name
    FROM reservations r
    LEFT JOIN available_dates ad ON r.date = ad.date AND r.time = ad.time
    LEFT JOIN menu_items m1 ON ad.menu_id = m1.id
    LEFT JOIN menu_items m2 ON ad.drink_id = m2.id
    WHERE r.user_name = ?
    ORDER BY r.date, r.time
  `
    )
    .all(locals.user.name);

  return json(userReservations);
}
