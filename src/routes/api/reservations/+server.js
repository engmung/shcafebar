import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, time, guests, menuRequest, drinkRequest } =
    await request.json();

  db.prepare("BEGIN TRANSACTION").run();

  try {
    const availableDate = db
      .prepare("SELECT * FROM available_dates WHERE date = ? AND time = ?")
      .get(date, time);

    if (!availableDate || guests > availableDate.capacity) {
      db.prepare("ROLLBACK").run();
      return json(
        { error: "Date not available or insufficient capacity" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        "INSERT INTO reservations (user_name, date, time, guests, menu_request, drink_request) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(locals.user.name, date, time, guests, menuRequest, drinkRequest);

    db.prepare(
      "UPDATE available_dates SET capacity = capacity - ? WHERE id = ?"
    ).run(guests, availableDate.id);

    db.prepare("COMMIT").run();

    return json({ success: true });
  } catch (error) {
    db.prepare("ROLLBACK").run();
    console.error("Error creating reservation:", error);
    return json(
      { error: "Failed to create reservation: " + error.message },
      { status: 500 }
    );
  }
}
