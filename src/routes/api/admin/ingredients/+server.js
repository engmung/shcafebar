import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const ingredients = db
    .prepare("SELECT * FROM ingredients ORDER BY name")
    .all();
  return json(ingredients);
}

export async function POST({ request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, cost, characteristics, volume, unit, min_volume } =
    await request.json();

  const result = db
    .prepare(
      "INSERT INTO ingredients (name, cost, characteristics, volume, unit, min_volume) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(name, cost, characteristics, volume, unit, min_volume);

  if (result.changes > 0) {
    return json({ success: true, id: result.lastInsertRowid });
  } else {
    return json({ error: "Failed to add ingredient" }, { status: 500 });
  }
}
