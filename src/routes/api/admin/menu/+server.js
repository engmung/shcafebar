import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Received data:", JSON.stringify(data));

    const {
      name,
      description,
      price,
      category,
      ingredients,
      detail_content,
      is_visible,
    } = data;

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
        );

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
  } catch (error) {
    console.error("Error parsing request body:", error);
    return json(
      { error: "Failed to parse request body: " + error.message },
      { status: 400 }
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

export async function PUT({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  let data;

  try {
    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData);
      // Parse JSON strings
      ["price", "is_visible", "ingredients"].forEach((key) => {
        if (data[key]) {
          try {
            data[key] = JSON.parse(data[key]);
          } catch (e) {
            console.error(`Failed to parse ${key}:`, e);
          }
        }
      });
    }
    console.log("Received data for update:", JSON.stringify(data));
  } catch (error) {
    console.error("Error parsing request data:", error);
    return json({ error: "Invalid request data" }, { status: 400 });
  }

  const {
    name,
    description,
    price,
    category,
    ingredients,
    detail_content,
    is_visible,
  } = data;

  db.prepare("BEGIN TRANSACTION").run();

  try {
    db.prepare(
      `
      UPDATE menu_items 
      SET name = ?, description = ?, price = ?, category = ?, detail_content = ?, is_visible = ? 
      WHERE id = ?
    `
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

    console.log("Menu item updated successfully:", id);

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
