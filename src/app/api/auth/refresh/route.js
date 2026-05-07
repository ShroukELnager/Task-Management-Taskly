import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const secure = process.env.NODE_ENV === "production";

  const refresh_token = cookieStore.get("refresh_token")?.value;

  if (!refresh_token) {
    return Response.json({ error: "No refresh token" }, { status: 401 });
  }

  if (!apiKey) {
    return Response.json({ error: "Missing API key" }, { status: 500 });
  }

  const res = await fetch(
    "https://pcufxstnppfqmzgslxlk.supabase.co/auth/v1/token?grant_type=refresh_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ refresh_token }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return Response.json(data, { status: 400 });
  }

  cookieStore.set("access_token", data.access_token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
  });
  cookieStore.set("expires_at", data.expires_at.toString(), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
  });

  return Response.json({ success: true });
}
