import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ params }) {
  const { id } = params;

  try {
    const images = db
      .prepare(
        "SELECT * FROM menu_images WHERE menu_id = ? ORDER BY is_primary DESC"
      )
      .all(id);
    console.log(`Images for menu item ${id}:`, images); // 로깅 추가
    return json(images);
  } catch (error) {
    console.error(`Error fetching images for menu item ${id}:`, error);
    return json({ error: "Failed to fetch menu images" }, { status: 500 });
  }
}
