import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET() {
  const dates = db
    .prepare(
      `
    SELECT 
      ad.*,
      m1.name as menu_name,
      m1.price as menu_price,
      m2.name as drink_name,
      m2.price as drink_price,
      COALESCE(SUM(r.guests), 0) as reserved_capacity
    FROM available_dates ad
    LEFT JOIN menu_items m1 ON ad.menu_id = m1.id AND m1.category = 'food'
    LEFT JOIN menu_items m2 ON ad.drink_id = m2.id AND m2.category = 'drink'
    LEFT JOIN reservations r ON ad.date = r.date AND ad.time = r.time
    WHERE ad.date >= date('now')
    GROUP BY ad.id
    ORDER BY ad.date, ad.time
  `
    )
    .all();

  const processedDates = dates.map((date) => ({
    ...date,
    reserved_capacity: parseInt(date.reserved_capacity),
    available_capacity: date.capacity - parseInt(date.reserved_capacity),
  }));

  return json(processedDates);
}
