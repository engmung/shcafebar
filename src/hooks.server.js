import { dev } from "$app/environment";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // CORS 설정
  if (event.request.method !== "OPTIONS") {
    event.request.headers.set("Access-Control-Allow-Origin", "*");
  }

  const session = event.cookies.get("session");
  if (session) {
    try {
      event.locals.user = JSON.parse(session);
    } catch (error) {
      console.error("Failed to parse session:", error);
      event.cookies.delete("session", { path: "/" });
    }
  }

  const response = await resolve(event);

  // CORS 헤더 설정
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // 쿠키 설정 수정
  const sessionCookie = response.headers.get("Set-Cookie");
  if (sessionCookie) {
    response.headers.set(
      "Set-Cookie",
      sessionCookie + `; SameSite=Lax; ${dev ? "Secure; " : ""}HttpOnly`
    );
  }

  return response;
}
