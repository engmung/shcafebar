// File: src/routes/api/menu/[id]/images/+server.js

import { db } from "$lib/db";
import { json } from "@sveltejs/kit";

export function GET({ params }) {
  const { id } = params;

  try {
    const images = db
      .prepare("SELECT * FROM menu_images WHERE menu_id = ?")
      .all(id);
    return json(images);
  } catch (error) {
    console.error("Error fetching menu images:", error);
    return json({ error: "Failed to fetch menu images" }, { status: 500 });
  }
}
