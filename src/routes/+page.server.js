import { db } from "$lib/db";

export function load() {
  const insertUser = db.prepare(
    "INSERT OR IGNORE INTO users (name, role) VALUES (?, ?)"
  );
  insertUser.run("이승훈", "user");
  insertUser.run("yc2313", "admin");

  const users = db.prepare("SELECT * FROM users").all();
  return {
    users,
  };
}
