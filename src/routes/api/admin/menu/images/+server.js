// File: src/routes/api/admin/menu/images/+server.js

import { db } from "$lib/db";
import { json } from "@sveltejs/kit";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

export async function POST({ request, locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const menuId = formData.get("menuId");
  const file = formData.get("image");
  const isPrimary = formData.get("isPrimary") === "true";

  if (!file) {
    return json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileExtension = path.extname(file.name);
  const fileName = `${randomUUID()}${fileExtension}`;
  const filePath = path.join(process.cwd(), "static", "uploads", fileName);

  try {
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const imageUrl = `/uploads/${fileName}`;

    if (isPrimary) {
      // Set all other images for this menu item as non-primary
      db.prepare("UPDATE menu_images SET is_primary = 0 WHERE menu_id = ?").run(
        menuId
      );
    }

    const result = db
      .prepare(
        "INSERT INTO menu_images (menu_id, image_url, is_primary) VALUES (?, ?, ?)"
      )
      .run(menuId, imageUrl, isPrimary ? 1 : 0);

    return json({ success: true, id: result.lastInsertRowid, imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return json({ error: "Failed to upload image" }, { status: 500 });
  }
}
