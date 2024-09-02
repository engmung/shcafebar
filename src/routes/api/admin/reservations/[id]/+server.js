import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { date, time, guests, menu_id, drink_id } = await request.json();

  db.prepare("BEGIN TRANSACTION").run();

  try {
    const oldReservation = db
      .prepare("SELECT * FROM reservations WHERE id = ?")
      .get(id);

    if (!oldReservation) {
      db.prepare("ROLLBACK").run();
      return json({ error: "Reservation not found" }, { status: 404 });
    }

    // Update the reservation
    db.prepare(
      `
      UPDATE reservations 
      SET date = ?, time = ?, guests = ?
      WHERE id = ?
    `
    ).run(date, time, guests, id);

    // Update the available date
    let availableDate = db
      .prepare("SELECT * FROM available_dates WHERE date = ? AND time = ?")
      .get(date, time);

    if (!availableDate) {
      // If the available date doesn't exist, create it
      db.prepare(
        `
        INSERT INTO available_dates (date, time, capacity, menu_id, drink_id)
        VALUES (?, ?, ?, ?, ?)
      `
      ).run(date, time, 0, menu_id, drink_id);

      availableDate = db
        .prepare("SELECT * FROM available_dates WHERE date = ? AND time = ?")
        .get(date, time);
    } else {
      // Update the existing available date
      db.prepare(
        `
        UPDATE available_dates
        SET menu_id = ?, drink_id = ?
        WHERE date = ? AND time = ?
      `
      ).run(menu_id, drink_id, date, time);
    }

    // Update available capacity
    if (
      oldReservation.date !== date ||
      oldReservation.time !== time ||
      oldReservation.guests !== guests
    ) {
      // Remove guests from old date/time
      db.prepare(
        `
        UPDATE available_dates
        SET capacity = capacity + ?
        WHERE date = ? AND time = ?
      `
      ).run(oldReservation.guests, oldReservation.date, oldReservation.time);

      // Add guests to new date/time
      db.prepare(
        `
        UPDATE available_dates
        SET capacity = capacity - ?
        WHERE date = ? AND time = ?
      `
      ).run(guests, date, time);
    }

    db.prepare("COMMIT").run();

    return json({ success: true });
  } catch (error) {
    db.prepare("ROLLBACK").run();
    console.error("Error updating reservation:", error);
    return json(
      { error: "Failed to update reservation: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE({ params, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
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

    const deleteResult = db
      .prepare("DELETE FROM reservations WHERE id = ?")
      .run(id);

    if (deleteResult.changes > 0) {
      // Update available capacity
      const updateCapacityResult = db
        .prepare(
          "UPDATE available_dates SET capacity = capacity + ? WHERE date = ? AND time = ?"
        )
        .run(reservation.guests, reservation.date, reservation.time);

      if (updateCapacityResult.changes === 0) {
        // If no rows were updated, it means the available_date doesn't exist
        db.prepare(
          "INSERT INTO available_dates (date, time, capacity, menu_id, drink_id) VALUES (?, ?, ?, NULL, NULL)"
        ).run(reservation.date, reservation.time, reservation.guests);
      }

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
