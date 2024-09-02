import { db } from "$lib/db";
import { json } from "@sveltejs/kit";
import { dev } from "$app/environment";

export async function POST({ request, cookies }) {
  const { name } = await request.json();

  let user = db.prepare("SELECT * FROM users WHERE name = ?").get(name);

  if (!user) {
    const result = db
      .prepare("INSERT INTO users (name, role) VALUES (?, ?)")
      .run(name, "user");
    user = { id: result.lastInsertRowid, name, role: "user" };
  }

  cookies.set("session", JSON.stringify(user), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    maxAge: 60 * 60 * 24 * 7, // 1주일
  });

  return json({ success: true, user });
}
