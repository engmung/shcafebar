import { dev } from "$app/environment";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
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

  // SameSite 설정 추가 및 개발/프로덕션 환경에 따른 Secure 플래그 설정
  const sessionCookie = response.headers.get("Set-Cookie");
  if (sessionCookie) {
    response.headers.set(
      "Set-Cookie",
      sessionCookie + `; SameSite=Lax; ${dev ? "" : "Secure"}`
    );
  }

  return response;
}
