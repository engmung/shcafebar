import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET() {
  const menuItems = db
    .prepare(
      "SELECT * FROM menu_items WHERE is_visible = 1 ORDER BY category, name"
    )
    .all();
  return json(menuItems);
}
