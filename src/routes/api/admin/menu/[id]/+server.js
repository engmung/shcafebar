import { db } from "$lib/db";
import { json } from "@sveltejs/kit";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

export async function PUT({ params, request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Parse JSON strings
  ["price", "is_visible", "ingredients", "existing_images"].forEach((key) => {
    if (data[key]) {
      try {
        data[key] = JSON.parse(data[key]);
      } catch (e) {
        console.error(`Failed to parse ${key}:`, e);
      }
    }
  });

  console.log("Received data for update:", JSON.stringify(data));

  const {
    name,
    description,
    price,
    category,
    ingredients,
    detail_content,
    is_visible,
    existing_images,
  } = data;

  db.prepare("BEGIN TRANSACTION").run();

  try {
    // Update menu item
    db.prepare(
      `UPDATE menu_items 
      SET name = ?, description = ?, price = ?, category = ?, detail_content = ?, is_visible = ? 
      WHERE id = ?`
    ).run(
      name,
      description,
      price,
      category,
      detail_content,
      is_visible ? 1 : 0,
      id
    );

    // Update ingredients
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

    // Handle image updates
    const existingImageUrls = new Set(existing_images || []);
    const currentImages = db
      .prepare("SELECT * FROM menu_images WHERE menu_id = ?")
      .all(id);

    // Remove images that are no longer in the existing_images list
    for (const image of currentImages) {
      if (!existingImageUrls.has(image.image_url)) {
        db.prepare("DELETE FROM menu_images WHERE id = ?").run(image.id);
        const filePath = path.join(process.cwd(), "static", image.image_url);
        await unlink(filePath);
      }
    }

    // Add new images
    const newImageKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("new_image_")
    );
    if (newImageKeys.length > 0) {
      const insertImage = db.prepare(
        "INSERT INTO menu_images (menu_id, image_url, is_primary) VALUES (?, ?, ?)"
      );

      for (const key of newImageKeys) {
        const image = formData.get(key);
        if (image && image.name) {
          const fileExtension = path.extname(image.name);
          const fileName = `${randomUUID()}${fileExtension}`;
          const filePath = path.join(
            process.cwd(),
            "static",
            "uploads",
            fileName
          );

          await writeFile(filePath, Buffer.from(await image.arrayBuffer()));
          const imageUrl = `/uploads/${fileName}`;
          insertImage.run(id, imageUrl, currentImages.length === 0 ? 1 : 0);
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

export async function DELETE({ params, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  db.prepare("BEGIN TRANSACTION").run();

  try {
    // Delete menu ingredients
    db.prepare("DELETE FROM menu_ingredients WHERE menu_id = ?").run(id);

    // Get and delete menu images
    const images = db
      .prepare("SELECT image_url FROM menu_images WHERE menu_id = ?")
      .all(id);
    db.prepare("DELETE FROM menu_images WHERE menu_id = ?").run(id);

    // Delete image files
    for (const image of images) {
      const filePath = path.join(process.cwd(), "static", image.image_url);
      await unlink(filePath);
    }

    // Delete menu item
    const result = db.prepare("DELETE FROM menu_items WHERE id = ?").run(id);

    if (result.changes === 0) {
      db.prepare("ROLLBACK").run();
      return json({ error: "Menu item not found" }, { status: 404 });
    }

    db.prepare("COMMIT").run();
    console.log("Menu item deleted successfully:", id);
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
