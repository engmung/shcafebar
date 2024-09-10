import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET() {
  try {
    const menuItems = db
      .prepare(
        `
      SELECT 
        mi.*,
        (SELECT image_url FROM menu_images WHERE menu_id = mi.id ORDER BY is_primary DESC LIMIT 1) as primary_image_url
      FROM menu_items mi
      WHERE mi.is_visible = 1
      ORDER BY mi.category, mi.name
    `
      )
      .all();

    // 각 메뉴 아이템에 대한 모든 이미지 정보를 가져옵니다
    for (const item of menuItems) {
      item.images = db
        .prepare(
          `
        SELECT * FROM menu_images
        WHERE menu_id = ?
        ORDER BY is_primary DESC
      `
        )
        .all(item.id);
    }

    return json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}
