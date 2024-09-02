import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { name, cost, characteristics, volume, unit, min_volume } =
    await request.json();

  const result = db
    .prepare(
      "UPDATE ingredients SET name = ?, cost = ?, characteristics = ?, volume = ?, unit = ?, min_volume = ? WHERE id = ?"
    )
    .run(name, cost, characteristics, volume, unit, min_volume, id);

  if (result.changes > 0) {
    return json({ success: true });
  } else {
    return json({ error: "Failed to update ingredient" }, { status: 404 });
  }
}

export function DELETE({ params, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  const result = db.prepare("DELETE FROM ingredients WHERE id = ?").run(id);

  if (result.changes > 0) {
    return json({ success: true });
  } else {
    return json({ error: "Failed to delete ingredient" }, { status: 404 });
  }
}
