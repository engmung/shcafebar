import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ params, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tableName } = params;

  const validTables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((t) => t.name);
  if (!validTables.includes(tableName)) {
    return json({ error: "Invalid table name" }, { status: 400 });
  }

  const data = db.prepare(`SELECT * FROM ${tableName}`).all();
  return json(data);
}

export async function DELETE({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tableName } = params;
  const { id } = await request.json();

  const validTables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((t) => t.name);
  if (!validTables.includes(tableName)) {
    return json({ error: "Invalid table name" }, { status: 400 });
  }

  const query = `DELETE FROM ${tableName} WHERE id = ?`;
  const result = db.prepare(query).run(id);

  if (result.changes > 0) {
    return json({ success: true });
  } else {
    return json({ error: "Failed to delete record" }, { status: 500 });
  }
}

export async function PUT({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tableName } = params;
  const updateData = await request.json();
  const id = updateData.id;

  const validTables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((t) => t.name);
  if (!validTables.includes(tableName)) {
    return json({ error: "Invalid table name" }, { status: 400 });
  }

  const fieldsToUpdate = Object.keys(updateData).filter((key) => key !== "id");
  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => updateData[field]);

  const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

  try {
    const result = db.prepare(query).run(...values, id);
    return json({ success: true, changes: result.changes });
  } catch (error) {
    console.error("Error updating record:", error);
    return json(
      { error: "Failed to update record: " + error.message },
      { status: 500 }
    );
  }
}
