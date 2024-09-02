import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { date, time, capacity, menu_id, drink_id } = await request.json();

  try {
    // 유효한 menu_id 확인
    const validMenu = db
      .prepare("SELECT id FROM menu_items WHERE id = ? AND category = 'food'")
      .get(menu_id);
    if (menu_id && !validMenu) {
      return json({ error: "Invalid menu_id" }, { status: 400 });
    }

    // 유효한 drink_id 확인
    const validDrink = db
      .prepare("SELECT id FROM menu_items WHERE id = ? AND category = 'drink'")
      .get(drink_id);
    if (drink_id && !validDrink) {
      return json({ error: "Invalid drink_id" }, { status: 400 });
    }

    const result = db
      .prepare(
        `
      UPDATE available_dates 
      SET date = ?, time = ?, capacity = ?, menu_id = ?, drink_id = ?
      WHERE id = ?
    `
      )
      .run(date, time, capacity, menu_id || null, drink_id || null, id);

    if (result.changes > 0) {
      return json({ success: true });
    } else {
      return json(
        { error: "Failed to update available date" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating available date:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE({ params, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  db.prepare("BEGIN TRANSACTION").run();

  try {
    // 먼저 해당 날짜의 정보를 가져옵니다.
    const availableDate = db
      .prepare("SELECT date, time FROM available_dates WHERE id = ?")
      .get(id);

    if (!availableDate) {
      db.prepare("ROLLBACK").run();
      return json({ error: "Available date not found" }, { status: 404 });
    }

    // 해당 날짜의 모든 예약을 삭제합니다.
    db.prepare("DELETE FROM reservations WHERE date = ? AND time = ?").run(
      availableDate.date,
      availableDate.time
    );

    // 이제 available_date를 삭제합니다.
    const result = db
      .prepare("DELETE FROM available_dates WHERE id = ?")
      .run(id);

    if (result.changes > 0) {
      db.prepare("COMMIT").run();
      return json({ success: true });
    } else {
      db.prepare("ROLLBACK").run();
      return json(
        { error: "Failed to delete available date" },
        { status: 404 }
      );
    }
  } catch (error) {
    db.prepare("ROLLBACK").run();
    console.error("Error deleting available date:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
