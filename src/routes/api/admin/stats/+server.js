import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = {
    totalReservations: db
      .prepare("SELECT COUNT(*) as count FROM reservations")
      .get().count,
    pendingReservations: db
      .prepare("SELECT COUNT(*) as count FROM reservations WHERE status = ?")
      .get("pending").count,
    totalMenuItems: db.prepare("SELECT COUNT(*) as count FROM menu_items").get()
      .count,
    totalUsers: db.prepare("SELECT COUNT(*) as count FROM users").get().count,
  };

  return json(stats);
}
