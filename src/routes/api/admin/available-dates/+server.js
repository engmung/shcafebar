import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

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
    LEFT JOIN menu_items m1 ON ad.menu_id = m1.id
    LEFT JOIN menu_items m2 ON ad.drink_id = m2.id
    LEFT JOIN reservations r ON ad.date = r.date AND ad.time = r.time
    GROUP BY ad.id
    ORDER BY ad.date, ad.time
  `
    )
    .all();

  return json(dates);
}

export async function POST({ request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, time, capacity, menu_id, drink_id } = await request.json();

  console.log("Received data:", { date, time, capacity, menu_id, drink_id }); // 디버깅용

  try {
    // 유효한 menu_id 확인
    const validMenu = db
      .prepare("SELECT id FROM menu_items WHERE id = ? AND category = 'food'")
      .get(menu_id);
    console.log("Valid menu:", validMenu); // 디버깅용

    // 유효한 drink_id 확인
    const validDrink = db
      .prepare("SELECT id FROM menu_items WHERE id = ? AND category = 'drink'")
      .get(drink_id);
    console.log("Valid drink:", validDrink); // 디버깅용

    if ((menu_id && !validMenu) || (drink_id && !validDrink)) {
      return json({ error: "Invalid menu_id or drink_id" }, { status: 400 });
    }

    const result = db
      .prepare(
        "INSERT INTO available_dates (date, time, capacity, menu_id, drink_id) VALUES (?, ?, ?, ?, ?)"
      )
      .run(date, time, capacity, menu_id || null, drink_id || null);

    console.log("Insert result:", result); // 디버깅용

    if (result.changes > 0) {
      return json({ success: true, id: result.lastInsertRowid });
    } else {
      return json({ error: "Failed to add available date" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error adding available date:", error);
    return json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
