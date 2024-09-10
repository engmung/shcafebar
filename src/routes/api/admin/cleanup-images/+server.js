import { db } from "$lib/db";
import { json } from "@sveltejs/kit";
import { unlink, readdir } from "fs/promises";
import path from "path";

export async function POST({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const uploadDir = path.join(process.cwd(), "static", "uploads");
    const files = await readdir(uploadDir);

    // Get all image URLs from the database
    const dbImages = db.prepare("SELECT image_url FROM menu_images").all();
    const dbImageUrls = new Set(
      dbImages.map((img) => img.image_url.replace("/uploads/", ""))
    );

    let removedCount = 0;

    for (const file of files) {
      if (!dbImageUrls.has(file)) {
        await unlink(path.join(uploadDir, file));
        removedCount++;
      }
    }

    return json({ success: true, removedCount });
  } catch (error) {
    console.error("Error cleaning up images:", error);
    return json(
      { error: "Failed to clean up images: " + error.message },
      { status: 500 }
    );
  }
}
