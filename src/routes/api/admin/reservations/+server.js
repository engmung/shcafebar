import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reservations = db
      .prepare(
        `
      SELECT r.*, 
             m1.name as menu_name, 
             m2.name as drink_name
      FROM reservations r
      LEFT JOIN available_dates ad ON r.date = ad.date AND r.time = ad.time
      LEFT JOIN menu_items m1 ON ad.menu_id = m1.id
      LEFT JOIN menu_items m2 ON ad.drink_id = m2.id
      ORDER BY r.date, r.time
    `
      )
      .all();

    return json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}
