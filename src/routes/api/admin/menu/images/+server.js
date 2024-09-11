import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { db } from "$lib/db";

export async function POST({ request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const formData = await request.formData();
    const menuId = formData.get("menuId");
    const file = formData.get("image");
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const menuItem = db
      .prepare("SELECT name FROM menu_items WHERE id = ?")
      .get(menuId);
    if (!menuItem) {
      return new Response(JSON.stringify({ error: "Menu item not found" }), {
        status: 404,
      });
    }

    const fileExtension = path.extname(file.name);
    const sanitizedMenuName = menuItem.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const fileName = `${sanitizedMenuName}_${Date.now()}${fileExtension}`;
    const filePath = path.join(process.cwd(), "static", "uploads", fileName);

    const writeStream = createWriteStream(filePath);
    await pipeline(file.stream(), writeStream);

    const imageUrl = `/uploads/${fileName}`;

    if (isPrimary) {
      db.prepare("UPDATE menu_images SET is_primary = 0 WHERE menu_id = ?").run(
        menuId
      );
    }

    const result = db
      .prepare(
        "INSERT INTO menu_images (menu_id, image_url, is_primary) VALUES (?, ?, ?)"
      )
      .run(menuId, imageUrl, isPrimary ? 1 : 0);

    return new Response(
      JSON.stringify({ success: true, id: result.lastInsertRowid, imageUrl }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to upload image" }),
      { status: 500 }
    );
  }
}
