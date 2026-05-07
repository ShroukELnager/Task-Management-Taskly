import { getTokens } from "@/app/lib/auth/getTokens";

async function readJsonSafely(res) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function handleAcceptInvitation(req) {
  const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co";

  try {
    const apiKey = process.env.API_KEY?.trim();

    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    const body = await req.json();
    const { p_token } = body;

    if (!p_token) {
      return Response.json({ error: "p_token is required" }, { status: 400 });
    }

    const { access_token } = await getTokens();

    if (!access_token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${baseUrl}/rest/v1/rpc/accept_invitation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ p_token }),
    });

    const data = await readJsonSafely(res);

    if (!res.ok) {
      return Response.json(
        { error: data?.message || data?.error || "Failed to accept invitation" },
        { status: res.status }
      );
    }
    

    return Response.json({
      message: "Invitation accepted successfully",
      data,
    });
  } catch (err) {
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  return handleAcceptInvitation(req);
}
