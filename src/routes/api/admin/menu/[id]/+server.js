import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const {
    name,
    description,
    price,
    category,
    ingredients,
    detail_content,
    is_visible,
  } = await request.json();

  db.prepare("BEGIN TRANSACTION").run();

  try {
    db.prepare(
      "UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, detail_content = ?, is_visible = ? WHERE id = ?"
    ).run(
      name,
      description,
      price,
      category,
      detail_content,
      is_visible ? 1 : 0,
      id
    );

    db.prepare("DELETE FROM menu_ingredients WHERE menu_id = ?").run(id);

    if (ingredients && ingredients.length > 0) {
      const insertIngredient = db.prepare(
        "INSERT INTO menu_ingredients (menu_id, ingredient_id, amount, unit) VALUES (?, ?, ?, ?)"
      );

      for (const ingredient of ingredients) {
        if (ingredient.id && ingredient.id !== "") {
          insertIngredient.run(
            id,
            ingredient.id,
            ingredient.amount,
            ingredient.unit
          );
        }
      }
    }

    db.prepare("COMMIT").run();

    return json({ success: true });
  } catch (error) {
    db.prepare("ROLLBACK").run();
    console.error("Error updating menu item:", error);
    return json(
      { error: "Failed to update menu item: " + error.message },
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
    db.prepare("DELETE FROM menu_ingredients WHERE menu_id = ?").run(id);
    const result = db.prepare("DELETE FROM menu_items WHERE id = ?").run(id);

    db.prepare("COMMIT").run();

    if (result.changes === 0) {
      return json({ error: "Menu item not found" }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    db.prepare("ROLLBACK").run();
    console.error("Error deleting menu item:", error);
    return json(
      { error: "Failed to delete menu item: " + error.message },
      { status: 500 }
    );
  }
}
