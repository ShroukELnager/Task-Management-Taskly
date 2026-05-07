import { getTokens } from "@/app/lib/auth/getTokens";

async function handleResetPassword(req) {
  const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co/auth/v1";

  try {
    const apiKey = process.env.API_KEY?.trim();

    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    const body = await req.json();
    const { accessToken, ...payload } = body;

    const { access_token } = await getTokens();
    const token = accessToken || cookieAccessToken;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${baseUrl}/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: 400 });
    }

    return Response.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req) {
  return handleResetPassword(req);
}

export async function PUT(req) {
  return handleResetPassword(req);
}
