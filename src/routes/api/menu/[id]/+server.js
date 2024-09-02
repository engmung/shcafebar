import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ params }) {
  const { id } = params;

  try {
    const menuItem = db
      .prepare("SELECT * FROM menu_items WHERE id = ?")
      .get(id);

    if (!menuItem) {
      return json({ error: "Menu item not found" }, { status: 404 });
    }

    menuItem.ingredients = db
      .prepare(
        `
      SELECT i.name, mi.amount, mi.unit
      FROM menu_ingredients mi
      JOIN ingredients i ON mi.ingredient_id = i.id
      WHERE mi.menu_id = ?
    `
      )
      .all(id);

    return json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return json(
      { error: "Failed to fetch menu item: " + error.message },
      { status: 500 }
    );
  }
}
