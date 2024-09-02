import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lowStockIngredients = db
      .prepare(
        "SELECT * FROM ingredients WHERE volume <= min_volume AND min_volume IS NOT NULL"
      )
      .all();

    return json(lowStockIngredients);
  } catch (error) {
    console.error("Error fetching low stock ingredients:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}
