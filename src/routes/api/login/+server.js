import { db } from "$lib/db";
import { json } from "@sveltejs/kit";
import { dev } from "$app/environment";

export async function POST({ request, cookies }) {
  const { name } = await request.json();

  let user = db.prepare("SELECT * FROM users WHERE name = ?").get(name);

  if (!user) {
    try {
      const result = db
        .prepare("INSERT INTO users (name, role) VALUES (?, ?)")
        .run(name, "user");
      user = { id: result.lastInsertRowid, name, role: "user" };
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT") {
        user = db.prepare("SELECT * FROM users WHERE name = ?").get(name);
      } else {
        console.error("Error creating user:", error);
        return json({ error: "Failed to create user" }, { status: 500 });
      }
    }
  }

  cookies.set("session", JSON.stringify(user), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return json({ success: true, user });
}
