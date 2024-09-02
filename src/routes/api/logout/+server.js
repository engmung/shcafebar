import { json } from "@sveltejs/kit";
import { dev } from "$app/environment";

export function POST({ cookies }) {
  cookies.delete("session", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
  });
  return json({ success: true });
}
