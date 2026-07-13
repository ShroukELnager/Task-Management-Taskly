import { cookies } from "next/headers";

export async function POST(req) {
  const BASE_URL = "https://pcufxstnppfqmzgslxlk.supabase.co/auth/v1";

  try {
    const apiKey = process.env.API_KEY?.trim();

    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    const body = await req.json();
    const { email, password, name, jobTitle } = body;

    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          name: name ?? "",
          job_title: jobTitle ?? "",
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: 400 });
    }

    const response = {
      user: data.user,
      message: "Signup successful",
    };

    if (data.access_token) {
      const cookieStore = await cookies();
      const secure = process.env.NODE_ENV === "production";

      cookieStore.set("access_token", data.access_token, {
        httpOnly: true,
        secure,
        sameSite: "strict",
        path: "/",
      });

      cookieStore.set("refresh_token", data.refresh_token, {
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

      response.access_token = data.access_token;
      response.refresh_token = data.refresh_token;
      response.expires_at = data.expires_at;
    }

    return Response.json(response);
  } catch (err) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
