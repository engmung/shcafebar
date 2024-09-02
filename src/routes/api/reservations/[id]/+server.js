import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function DELETE({ params, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  db.prepare("BEGIN TRANSACTION").run();

  try {
    const reservation = db
      .prepare("SELECT * FROM reservations WHERE id = ?")
      .get(id);

    if (!reservation) {
      db.prepare("ROLLBACK").run();
      return json({ error: "Reservation not found" }, { status: 404 });
    }

    if (
      locals.user.role !== "admin" &&
      reservation.user_name !== locals.user.name
    ) {
      db.prepare("ROLLBACK").run();
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleteResult = db
      .prepare("DELETE FROM reservations WHERE id = ?")
      .run(id);

    if (deleteResult.changes > 0) {
      // Increase the available capacity
      db.prepare(
        `
        UPDATE available_dates 
        SET capacity = capacity + ? 
        WHERE date = ? AND time = ?
      `
      ).run(reservation.guests, reservation.date, reservation.time);

      db.prepare("COMMIT").run();
      return json({ success: true });
    } else {
      db.prepare("ROLLBACK").run();
      return json({ error: "Failed to cancel reservation" }, { status: 500 });
    }
  } catch (error) {
    db.prepare("ROLLBACK").run();
    console.error("Error cancelling reservation:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
