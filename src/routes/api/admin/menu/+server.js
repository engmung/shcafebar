import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    name,
    description,
    price,
    category,
    ingredients,
    detail_content,
    is_visible,
  } = await request.json();

  console.log("Received new item data:", {
    name,
    description,
    price,
    category,
    ingredients,
    detail_content,
    is_visible,
  });

  db.prepare("BEGIN TRANSACTION").run();

  try {
    const result = db
      .prepare(
        "INSERT INTO menu_items (name, description, price, category, detail_content, is_visible) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        name,
        description,
        price,
        category,
        detail_content,
        is_visible ? 1 : 0
      ); // 여기를 수정

    const menuId = result.lastInsertRowid;

    if (ingredients && ingredients.length > 0) {
      const insertIngredient = db.prepare(
        "INSERT INTO menu_ingredients (menu_id, ingredient_id, amount, unit) VALUES (?, ?, ?, ?)"
      );

      for (const ingredient of ingredients) {
        if (ingredient.id && ingredient.id !== "") {
          insertIngredient.run(
            menuId,
            ingredient.id,
            ingredient.amount,
            ingredient.unit
          );
        }
      }
    }

    db.prepare("COMMIT").run();

    console.log("New item added successfully:", menuId);

    return json({ success: true, id: menuId });
  } catch (error) {
    db.prepare("ROLLBACK").run();
    console.error("Error adding menu item:", error);
    return json(
      { error: "Failed to add menu item: " + error.message },
      { status: 500 }
    );
  }
}

export function GET({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const menuItems = db
      .prepare(
        "SELECT id, name, description, price, category, detail_content, is_visible FROM menu_items"
      )
      .all()
      .map((item) => ({
        ...item,
        is_visible: Boolean(item.is_visible), // 정수를 boolean으로 변환
      }));

    for (const item of menuItems) {
      item.ingredients = db
        .prepare(
          `
        SELECT i.id, i.name, mi.amount, mi.unit
        FROM menu_ingredients mi
        JOIN ingredients i ON mi.ingredient_id = i.id
        WHERE mi.menu_id = ?
      `
        )
        .all(item.id);
    }

    console.log("Menu items:", menuItems);

    return json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return json(
      { error: "Failed to fetch menu items: " + error.message },
      { status: 500 }
    );
  }
}
